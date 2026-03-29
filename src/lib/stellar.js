import {
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Contract,
  xdr,
  ScInt,
  rpc,
} from '@stellar/stellar-sdk'

import { signTransaction, getAddress } from '@stellar/freighter-api'

const { Server, assembleTransaction, Api } = rpc

// ─── Config ────────────────────────────────────────────────────────────────
// CRA uses REACT_APP_ prefix (NOT import.meta.env / VITE_)
const NETWORK_PASSPHRASE = Networks.TESTNET
const RPC_URL            = 'https://soroban-testnet.stellar.org'
const CONTRACT_ID        = 'CBQBXJFVWDGGHEPHU2HLAJGRCSQIN3IXBLV5NJQ6CR7SYAQZDFSAQ6L6'

// ─── RPC Server ───────────────────────────────────────────────────────────
const server = new Server(RPC_URL, { allowHttp: false })

// ─── Wallet helpers ───────────────────────────────────────────────────────
export async function getWalletAddress() {
  const { address } = await getAddress()
  if (!address) throw new Error('Freighter not connected or locked')
  return address
}

export async function initWallet() {
  try { return await getWalletAddress() }
  catch { return null }
}

export function getContractId() { return CONTRACT_ID }
export function getNetwork()    { return NETWORK_PASSPHRASE }

// ─── ScVal helpers ────────────────────────────────────────────────────────
// eslint-disable-next-line no-undef
const toBigInt = (n) => {
  const num = Number(n)
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    throw new Error(`Invalid u64 value: ${n} (got ${num})`)
  }
  return BigInt(Math.round(num))
}

function u64(n) {
  return new ScInt(toBigInt(n), { type: 'u64' }).toU64()
}

// ─── Core: build → simulate → sign → submit → poll ───────────────────────
async function invokeContract(method, args = []) {
  const address = await getWalletAddress()
  const account  = await server.getAccount(address)
  const contract = new Contract(CONTRACT_ID)

  // 1. Build
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  // 2. Simulate
  const simResult = await server.simulateTransaction(tx)
  if (Api.isSimulationError(simResult)) {
    throw new Error(`Simulation error: ${simResult.error}`)
  }

  // 3. Assemble (injects soroban data + resource fee)
  const preparedTx = assembleTransaction(tx, simResult).build()

  // 4. Sign via Freighter
  const { signedTxXdr } = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    accountToSign: address,
  })

  // 5. Submit
  const sendResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
  )
  if (sendResult.status === 'ERROR') {
    throw new Error(`Submit error: ${JSON.stringify(sendResult.errorResult)}`)
  }

  // 6. Poll until confirmed (NOT_FOUND = still pending)
  const { hash } = sendResult
  let result = await server.getTransaction(hash)

  while (result.status === Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise(r => setTimeout(r, 1500))
    result = await server.getTransaction(hash)
  }

  if (result.status === Api.GetTransactionStatus.FAILED) {
    throw new Error('Transaction failed on-chain. Check testnet explorer.')
  }

  return result // .returnValue contains the contract return ScVal
}

// ─── Read-only (simulate only, no signature needed) ───────────────────────
async function readContract(method, args = []) {
  const address = await getWalletAddress()
  const account  = await server.getAccount(address)
  const contract = new Contract(CONTRACT_ID)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (Api.isSimulationError(simResult)) {
    throw new Error(`Read error: ${simResult.error}`)
  }

  return simResult.result?.retval ?? null
}

// ─── ScVal → plain JS ────────────────────────────────────────────────────
function scValToJs(val) {
  if (!val) return null
  const type = val.switch().name
  if (type === 'scvU64')    return Number(val.u64().toBigInt())
  if (type === 'scvBool')   return val.b()
  if (type === 'scvString') return val.str().toString()
  if (type === 'scvBytes')  return val.bytes().toString()
  if (type === 'scvSymbol') return val.sym().toString()
  return null
}

function scMapToObject(scVal) {
  if (!scVal) return null
  try {
    const entries = scVal.map()        // xdr.ScMapEntry[]
    const obj = {}
    for (const entry of entries) {
      const key = entry.key().sym().toString()   // contract keys are ScvSymbol
      obj[key] = scValToJs(entry.val())
    }
    return obj
  } catch (e) {
    console.error('scMapToObject error:', e)
    return null
  }
}

// ─── Contract write functions ─────────────────────────────────────────────

/**
 * mint_nft(creator_id, title, descrip, total_shares) → nft_id (u64)
 */
export async function simulateMintNFT(creatorId, title, descrip, totalShares) {
  const result = await invokeContract('mint_nft', [
    u64(creatorId),
    xdr.ScVal.scvString(title),
    xdr.ScVal.scvString(descrip),
    u64(totalShares),
  ])
  return Number(result.returnValue?.u64().toBigInt() ?? 0)
}

/**
 * transfer_shares(nft_id, from_id, to_id, amount)
 */
export async function simulateTransferShares(nftId, fromId, toId, amount) {
  await invokeContract('transfer_shares', [
    u64(nftId),
    u64(fromId),
    u64(toId),
    u64(amount),
  ])
}

/**
 * burn_nft(nft_id, burner_id)
 */
export async function simulateBurnNFT(nftId, burnerId) {
  await invokeContract('burn_nft', [
    u64(nftId),
    u64(burnerId),
  ])
}

// ─── Contract read functions ──────────────────────────────────────────────

export async function viewNFT(nftId) {
  const val = await readContract('view_nft', [u64(nftId)])
  return parseNFTData(scMapToObject(val))
}

export async function viewShares(nftId, holderId) {
  const val = await readContract('view_shares', [u64(nftId), u64(holderId)])
  return parseShareHolderData(scMapToObject(val))
}

export async function viewPlatformStats() {
  const val = await readContract('view_platform_stats', [])
  return parsePlatformStats(scMapToObject(val))
}

// ─── Data parsers ─────────────────────────────────────────────────────────
export function parseNFTData(result) {
  if (!result) return null
  try {
    if (result.nft_id && result.nft_id !== 0) {
      return {
        nftId:       Number(result.nft_id),
        title:       result.title || 'Unknown',
        descrip:     result.descrip || '',
        totalShares: Number(result.total_shares),
        ownerShares: Number(result.owner_shares),
        isActive:    result.is_active,
        createdAt:   Number(result.created_at),
      }
    }
  } catch (e) {
    console.error('Error parsing NFT data:', e)
  }
  return null
}

export function parseShareHolderData(result) {
  if (!result) return null
  return {
    nftId:    Number(result.nft_id),
    holderId: Number(result.holder_id),
    shares:   Number(result.shares),
  }
}

export function parsePlatformStats(result) {
  if (!result) return { totalNfts: 0, totalTransfers: 0, activeNfts: 0 }
  return {
    totalNfts:      Number(result.total_nfts),
    totalTransfers: Number(result.total_transfers),
    activeNfts:     Number(result.active_nfts),
  }
}