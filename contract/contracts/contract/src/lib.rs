#![allow(non_snake_case)]
#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, log, Env, Symbol, String, symbol_short};

// FractionalNFT struct holds metadata and fractional ownership details for an      NFT
#[contracttype]
#[derive(Clone)]
pub struct FractionalNFT {
    pub nft_id: u64,          // Unique identifier for the NFT
    pub title: String,        // Name/title of the NFT asset
    pub descrip: String,      // Description of the NFT asset
    pub total_shares: u64,    // Total number of fractional shares minted
    pub owner_shares: u64,    // Shares currently held by original creator/minter
    pub is_active: bool,      // Whether this NFT is still active (not burned)
    pub created_at: u64,      // Ledger timestamp when NFT was minted
}

// ShareHolder struct tracks how many shares a particular holder owns for a given NFT
#[contracttype]
#[derive(Clone)]
pub struct ShareHolder {
    pub nft_id: u64,    // NFT this shareholding refers to
    pub holder_id: u64, // Identifier for the holder (simulated user ID)
    pub shares: u64,    // Number of fractional shares held
}

// Stats struct for platform-wide overview
#[contracttype]
#[derive(Clone)]
pub struct PlatformStats {
    pub total_nfts: u64,        // Total NFTs ever minted on the platform
    pub total_transfers: u64,   // Total share-transfer transactions done
    pub active_nfts: u64,       // Number of NFTs currently active (not burned)
}

// Enum keys for NFT storage lookup by nft_id
#[contracttype]
pub enum NFTBook {
    NFT(u64),
}

// Enum keys for ShareHolder lookup (nft_id + holder_id pair)
#[contracttype]
pub enum ShareBook {
    Share(u64, u64), // (nft_id, holder_id)
}

// Symbol for platform-wide stats
const PLATFORM_STATS: Symbol = symbol_short!("PLT_STATS");

// Counter for generating unique NFT IDs
const NFT_COUNT: Symbol = symbol_short!("NFT_CNT");

#[contract]
pub struct FractionalNFTContract;

#[contractimpl]
impl FractionalNFTContract {

    // -------------------------------------------------------------------------
    // Function 1: mint_nft
    // Mints a new NFT and splits it into `total_shares` fractional shares.
    // The creator (identified by creator_id) starts with all shares.
    // Returns the unique nft_id of the newly minted NFT.
    // -------------------------------------------------------------------------
    pub fn mint_nft(
        env: Env,
        creator_id: u64,
        title: String,
        descrip: String,
        total_shares: u64,
    ) -> u64 {
        // Validate inputs
        if total_shares == 0 {
            log!(&env, "Total shares must be greater than zero");
            panic!("Total shares must be greater than zero");
        }

        // Increment NFT counter for unique ID
        let mut nft_count: u64 = env.storage().instance().get(&NFT_COUNT).unwrap_or(0);
        nft_count += 1;

        let time = env.ledger().timestamp();

        // Build the FractionalNFT record
        let nft = FractionalNFT {
            nft_id: nft_count,
            title,
            descrip,
            total_shares,
            owner_shares: total_shares, // creator starts with all shares
            is_active: true,
            created_at: time,
        };

        // Build the creator's initial shareholding record
        let holder = ShareHolder {
            nft_id: nft_count,
            holder_id: creator_id,
            shares: total_shares,
        };

        // Update platform stats
        let mut stats = Self::view_platform_stats(env.clone());
        stats.total_nfts += 1;
        stats.active_nfts += 1;

        // Persist all data
        env.storage().instance().set(&NFTBook::NFT(nft_count), &nft);
        env.storage().instance().set(&ShareBook::Share(nft_count, creator_id), &holder);
        env.storage().instance().set(&PLATFORM_STATS, &stats);
        env.storage().instance().set(&NFT_COUNT, &nft_count);
        env.storage().instance().extend_ttl(5000, 5000);

        log!(&env, "NFT minted with ID: {}, Shares: {}", nft_count, total_shares);
        nft_count
    }

    // -------------------------------------------------------------------------
    // Function 2: transfer_shares
    // Transfers `amount` fractional shares of `nft_id` from `from_id` to `to_id`.
    // Enforces that the sender has sufficient shares and the NFT is active.
    // -------------------------------------------------------------------------
    pub fn transfer_shares(
        env: Env,
        nft_id: u64,
        from_id: u64,
        to_id: u64,
        amount: u64,
    ) {
        if amount == 0 {
            log!(&env, "Transfer amount must be greater than zero");
            panic!("Transfer amount must be greater than zero");
        }

        // Fetch the NFT record
        let nft = Self::view_nft(env.clone(), nft_id.clone());
        if !nft.is_active {
            log!(&env, "NFT-ID: {} is not active", nft_id);
            panic!("NFT is not active");
        }

        // Fetch sender's share record
        let mut from_holder = Self::view_shares(env.clone(), nft_id.clone(), from_id.clone());
        if from_holder.shares < amount {
            log!(&env, "Insufficient shares: has {}, needs {}", from_holder.shares, amount);
            panic!("Insufficient shares to transfer");
        }

        // Fetch recipient's existing share record (defaults to 0 shares)
        let mut to_holder = Self::view_shares(env.clone(), nft_id.clone(), to_id.clone());

        // Perform the transfer
        from_holder.shares -= amount;
        to_holder.nft_id = nft_id;
        to_holder.holder_id = to_id;
        to_holder.shares += amount;

        // Update platform stats
        let mut stats = Self::view_platform_stats(env.clone());
        stats.total_transfers += 1;

        // Persist updated records
        env.storage().instance().set(&ShareBook::Share(nft_id, from_id), &from_holder);
        env.storage().instance().set(&ShareBook::Share(nft_id, to_id), &to_holder);
        env.storage().instance().set(&PLATFORM_STATS, &stats);
        env.storage().instance().extend_ttl(5000, 5000);

        log!(&env, "Transferred {} shares of NFT-ID: {} from {} to {}", amount, nft_id, from_id, to_id);
    }

    // -------------------------------------------------------------------------
    // Function 3: burn_nft
    // Burns (deactivates) an NFT identified by `nft_id`.
    // Only allowed if the caller (burner_id) holds ALL remaining shares,
    // ensuring full ownership before destruction.
    // -------------------------------------------------------------------------
    pub fn burn_nft(env: Env, nft_id: u64, burner_id: u64) {
        // Fetch NFT record
        let mut nft = Self::view_nft(env.clone(), nft_id.clone());
        if !nft.is_active {
            log!(&env, "NFT-ID: {} is already burned/inactive", nft_id);
            panic!("NFT is already inactive");
        }

        // Validate burner holds all shares
        let burner_holding = Self::view_shares(env.clone(), nft_id.clone(), burner_id.clone());
        if burner_holding.shares != nft.total_shares {
            log!(&env, "Burner does not hold all shares. Held: {}, Required: {}", burner_holding.shares, nft.total_shares);
            panic!("Must hold all shares to burn NFT");
        }

        // Deactivate the NFT
        nft.is_active = false;

        // Update platform stats
        let mut stats = Self::view_platform_stats(env.clone());
        if stats.active_nfts > 0 {
            stats.active_nfts -= 1;
        }

        // Persist updates
        env.storage().instance().set(&NFTBook::NFT(nft_id), &nft);
        env.storage().instance().set(&PLATFORM_STATS, &stats);
        env.storage().instance().extend_ttl(5000, 5000);

        log!(&env, "NFT-ID: {} has been burned by holder: {}", nft_id, burner_id);
    }

    // -------------------------------------------------------------------------
    // Function 4 (View): view_nft
    // Returns the FractionalNFT metadata for a given nft_id.
    // Returns a default "not found" struct if the NFT doesn't exist.
    // -------------------------------------------------------------------------
    pub fn view_nft(env: Env, nft_id: u64) -> FractionalNFT {
        env.storage().instance().get(&NFTBook::NFT(nft_id)).unwrap_or(FractionalNFT {
            nft_id: 0,
            title: String::from_str(&env, "Not_Found"),
            descrip: String::from_str(&env, "Not_Found"),
            total_shares: 0,
            owner_shares: 0,
            is_active: false,
            created_at: 0,
        })
    }

    // -------------------------------------------------------------------------
    // View: view_shares
    // Returns the ShareHolder record for a (nft_id, holder_id) pair.
    // Returns default (0 shares) if no record found.
    // -------------------------------------------------------------------------
    pub fn view_shares(env: Env, nft_id: u64, holder_id: u64) -> ShareHolder {
        env.storage().instance().get(&ShareBook::Share(nft_id, holder_id)).unwrap_or(ShareHolder {
            nft_id,
            holder_id,
            shares: 0,
        })
    }

    // -------------------------------------------------------------------------
    // View: view_platform_stats
    // Returns overall platform statistics (total NFTs, transfers, active NFTs).
    // -------------------------------------------------------------------------
    pub fn view_platform_stats(env: Env) -> PlatformStats {
        env.storage().instance().get(&PLATFORM_STATS).unwrap_or(PlatformStats {
            total_nfts: 0,
            total_transfers: 0,
            active_nfts: 0,
        })
    }
}