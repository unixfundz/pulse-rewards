//! Pulse Rewards Campaign Contract.
//!
//! Merchants register campaigns (with a PULSE token budget) on-chain.
//! Users can claim their reward once per campaign; the contract transfers
//! tokens directly from the campaign budget to the claimant.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Map,
};

// ── Storage keys ────────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Campaign(u64),     // campaign_id → CampaignData
    NextId,
    Claims(u64),       // campaign_id → Map<Address, bool>
}

// ── Data types ───────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct CampaignData {
    pub merchant: Address,
    pub token: Address,
    pub reward_per_claim: i128,
    pub remaining_budget: i128,
    pub starts_at: u64,  // Unix timestamp (seconds)
    pub ends_at: u64,
    pub active: bool,
}

// ── Contract ─────────────────────────────────────────────────
#[contract]
pub struct PulseRewardsContract;

#[contractimpl]
impl PulseRewardsContract {
    /// Initialize the contract with an admin.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextId, &1u64);
    }

    /// Register a new campaign. Caller must have already approved `budget` tokens
    /// to be transferred to this contract.
    ///
    /// Returns the new campaign ID.
    pub fn create_campaign(
        env: Env,
        merchant: Address,
        token: Address,
        reward_per_claim: i128,
        budget: i128,
        starts_at: u64,
        ends_at: u64,
    ) -> u64 {
        merchant.require_auth();

        if reward_per_claim <= 0 || budget < reward_per_claim {
            panic!("invalid reward_per_claim or budget");
        }
        if ends_at <= starts_at {
            panic!("ends_at must be after starts_at");
        }

        // Pull budget into contract escrow
        let token_client = token::TokenClient::new(&env, &token);
        token_client.transfer(&merchant, &env.current_contract_address(), &budget);

        let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap();
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        let campaign = CampaignData {
            merchant: merchant.clone(),
            token: token.clone(),
            reward_per_claim,
            remaining_budget: budget,
            starts_at,
            ends_at,
            active: true,
        };
        env.storage().persistent().set(&DataKey::Campaign(id), &campaign);
        env.storage()
            .persistent()
            .set(&DataKey::Claims(id), &Map::<Address, bool>::new(&env));

        env.events()
            .publish((symbol_short!("created"),), (id, merchant, reward_per_claim, budget));

        id
    }

    /// Claim a reward from campaign `campaign_id`.
    pub fn claim(env: Env, claimant: Address, campaign_id: u64) {
        claimant.require_auth();

        let mut campaign: CampaignData = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");

        if !campaign.active {
            panic!("campaign inactive");
        }

        let now = env.ledger().timestamp();
        if now < campaign.starts_at {
            panic!("campaign not started");
        }
        if now > campaign.ends_at {
            panic!("campaign ended");
        }

        if campaign.remaining_budget < campaign.reward_per_claim {
            panic!("campaign budget exhausted");
        }

        let mut claims: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&DataKey::Claims(campaign_id))
            .unwrap_or_else(|| Map::new(&env));

        if claims.contains_key(claimant.clone()) {
            panic!("already claimed");
        }

        // Transfer reward
        let token_client = token::TokenClient::new(&env, &campaign.token);
        token_client.transfer(
            &env.current_contract_address(),
            &claimant,
            &campaign.reward_per_claim,
        );

        campaign.remaining_budget -= campaign.reward_per_claim;
        claims.set(claimant.clone(), true);

        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id), &campaign);
        env.storage()
            .persistent()
            .set(&DataKey::Claims(campaign_id), &claims);

        env.events()
            .publish((symbol_short!("claimed"),), (campaign_id, claimant, campaign.reward_per_claim));
    }

    /// Deactivate a campaign (merchant or admin only). Returns remaining budget to merchant.
    pub fn deactivate(env: Env, caller: Address, campaign_id: u64) {
        caller.require_auth();

        let mut campaign: CampaignData = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != campaign.merchant && caller != admin {
            panic!("unauthorized");
        }

        if campaign.remaining_budget > 0 {
            let token_client = token::TokenClient::new(&env, &campaign.token);
            token_client.transfer(
                &env.current_contract_address(),
                &campaign.merchant,
                &campaign.remaining_budget,
            );
            campaign.remaining_budget = 0;
        }

        campaign.active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id), &campaign);

        env.events()
            .publish((symbol_short!("deactive"),), (campaign_id,));
    }

    /// Read campaign data.
    pub fn get_campaign(env: Env, campaign_id: u64) -> CampaignData {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        Env,
    };

    fn create_env() -> (Env, Address) {
        let env = Env::default();
        let contract_id = env.register_contract(None, PulseRewardsContract);
        (env, contract_id)
    }

    #[test]
    fn test_initialize() {
        let (env, contract_id) = create_env();
        let client = PulseRewardsContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        env.mock_all_auths();
        client.initialize(&admin);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_initialize() {
        let (env, contract_id) = create_env();
        let client = PulseRewardsContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        env.mock_all_auths();
        client.initialize(&admin);
        client.initialize(&admin);
    }

    #[test]
    #[should_panic(expected = "invalid reward_per_claim or budget")]
    fn test_invalid_budget() {
        let (env, contract_id) = create_env();
        let client = PulseRewardsContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let merchant = Address::generate(&env);
        let token = Address::generate(&env);
        env.mock_all_auths();
        client.initialize(&admin);
        // budget < reward_per_claim → should panic
        client.create_campaign(&merchant, &token, &100, &50, &1000, &2000);
    }

    #[test]
    #[should_panic(expected = "ends_at must be after starts_at")]
    fn test_invalid_timestamps() {
        let (env, contract_id) = create_env();
        let client = PulseRewardsContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let merchant = Address::generate(&env);
        let token = Address::generate(&env);
        env.mock_all_auths();
        client.initialize(&admin);
        client.create_campaign(&merchant, &token, &100, &1000, &2000, &1000);
    }
}
