# Fractional NFTs

## Table of Contents
- [Project Title](#fractional-nfts)
- [Project Description](#project-description)
- [Project Vision](#project-vision)
- [Key Features](#key-features)
- [Future Scope](#future-scope)

---

## Project Description

**Fractional NFTs** is a smart contract built on the **Stellar blockchain** using the **Soroban SDK**. It enables the minting of Non-Fungible Tokens (NFTs) that are split into multiple fractional shares, allowing partial ownership of a digital asset to be distributed across many holders. Instead of a single wallet owning an entire NFT, any number of participants can co-own a piece of it — democratizing access to high-value digital assets.

The contract provides three core write functions — **mint**, **transfer**, and **burn** — alongside view functions for querying NFT metadata, individual shareholdings, and platform-wide statistics. All state is persisted on-chain using Soroban's instance storage.

---

## Project Vision

The vision behind Fractional NFTs is to **break the barrier of exclusive ownership** in the NFT space. High-value digital assets — art, music, virtual real estate, collectibles — are often inaccessible to everyday users due to prohibitive price tags. By fractionalizating ownership on a transparent, decentralized blockchain, this project aims to:

- Make digital asset ownership **inclusive and community-driven**.
- Enable **collaborative investment** in NFTs without a centralized intermediary.
- Provide a **trustless and auditable** ownership model where every share transfer is recorded immutably on-chain.
- Lay the groundwork for a **decentralized NFT marketplace** where fractions can be freely traded.

---

## Key Features

| Feature | Description |
|---|---|
| 🎨 **Mint Fractional NFT** | Create a new NFT with a configurable number of fractional shares. The creator initially holds all shares. |
| 🔄 **Transfer Shares** | Send any number of owned shares to another holder. Enforces balance checks to prevent overdrafts. |
| 🔥 **Burn NFT** | Permanently deactivate an NFT. Only the holder of **all** shares may burn it, ensuring consensus. |
| 📊 **View NFT Metadata** | Query full metadata for any NFT by its unique ID (title, description, share count, status). |
| 👤 **View Shareholding** | Check how many shares any specific holder owns for a given NFT. |
| 📈 **Platform Statistics** | View aggregated stats — total NFTs minted, total share transfers, and currently active NFTs. |

### Smart Contract Functions

```
mint_nft(env, creator_id, title, descrip, total_shares) → nft_id
```
Mints a new fractional NFT. `creator_id` receives all `total_shares` initially.

```
transfer_shares(env, nft_id, from_id, to_id, amount)
```
Transfers `amount` shares of `nft_id` from `from_id` to `to_id`. Fails if sender lacks sufficient shares or NFT is inactive.

```
burn_nft(env, nft_id, burner_id)
```
Burns the NFT identified by `nft_id`. Caller (`burner_id`) must hold 100% of all shares.

```
view_nft(env, nft_id) → FractionalNFT
view_shares(env, nft_id, holder_id) → ShareHolder
view_platform_stats(env) → PlatformStats
```
Read-only queries for NFT data, individual holdings, and platform-level metrics.

---

## Images 
<img width="1585" height="905" alt="Screenshot from 2026-03-29 16-29-49" src="https://github.com/user-attachments/assets/58d39fbc-e824-48cb-ac37-a109a96abf4e" />
<img width="1585" height="905" alt="Screenshot from 2026-03-29 16-30-44" src="https://github.com/user-attachments/assets/40fabb39-b19b-4c1b-aab0-423f8f90b5cc" />
<img width="1585" height="905" alt="image" src="https://github.com/user-attachments/assets/86b5f137-bf76-49bc-aee6-a55228e4322a" />






## Future Scope

The current implementation provides a foundation for fractional NFT ownership. Planned enhancements include:

1. **On-Chain Marketplace** — Allow holders to list their fractional shares for sale at a specified price, enabling a fully decentralized peer-to-peer trading system within the contract.

2. **Multi-Asset Support** — Extend the contract to support different classes of assets (music, art, real estate tokens) with asset-type metadata and category-based filtering.

3. **Governance & Voting** — Introduce a proposal and voting system where share holders can vote on decisions about the NFT (e.g., licensing, display rights) proportional to their share ownership.

4. **Royalty Distribution** — Implement automatic royalty splitting so revenue generated from an NFT (e.g., usage fees or resale) is distributed to all share holders on-chain proportionally.

5. **Time-Locked Transfers** — Add optional vesting or lock-up periods for shares, useful for team allocations or investment arrangements.

6. **Cross-Contract Integration** — Allow integration with external Soroban token contracts (SAC — Stellar Asset Contract) to represent fractional shares as tradeable fungible tokens (FTs) on the Stellar DEX.

7. **Caller Authentication** — Replace simulated `holder_id` integers with real Stellar `Address` types for cryptographically verified ownership and authorization.

---


## Contract Details:
Contract ID: CBQBXJFVWDGGHEPHU2HLAJGRCSQIN3IXBLV5NJQ6CR7SYAQZDFSAQ6L6
<img width="1843" height="950" alt="Screenshot from 2026-03-28 17-37-42" src="https://github.com/user-attachments/assets/484d1a29-4227-459c-9aac-e5ddef0e778d" />


> Built with ❤️ on the Stellar Network using [Soroban SDK](https://soroban.stellar.org/)
