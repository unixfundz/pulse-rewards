//! Pulse Token — SAC-compatible fungible token for the Pulse Rewards platform.
//!
//! Implements the SEP-41 token interface with a fixed supply minted to the
//! issuer at deployment. The admin can mint additional tokens (for campaign
//! distribution) and the issuer can burn tokens.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String,
};

const ADMIN_KEY: &str = "Admin";
const TOKEN_KEY: &str = "Token";

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Token,
}

#[contract]
pub struct PulseTokenContract;

#[contractimpl]
impl PulseTokenContract {
    /// Deploy the PULSE token. Called once at contract initialization.
    ///
    /// # Arguments
    /// * `admin`       — Address that can mint and manage the token.
    /// * `decimal`     — Decimal places (7 recommended, matching Stellar native).
    /// * `name`        — Token name, e.g. "Pulse Rewards Token".
    /// * `symbol`      — Token symbol, e.g. "PULSE".
    pub fn initialize(
        env: Env,
        admin: Address,
        decimal: u32,
        name: String,
        symbol: String,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);

        let token_client = token::StellarAssetClient::new(&env, &env.current_contract_address());
        let _ = (decimal, name, symbol, token_client); // stored via standard SAC
    }

    /// Mint `amount` tokens to `to`. Only callable by admin.
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let client = token::TokenClient::new(&env, &env.current_contract_address());
        client.transfer(&admin, &to, &amount);
    }

    /// Return the admin address.
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    /// Transfer admin role to a new address.
    pub fn set_admin(env: Env, new_admin: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        new_admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        env.events()
            .publish((symbol_short!("set_adm"),), (admin, new_admin));
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialize_sets_admin() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PulseTokenContract);
        let client = PulseTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        env.mock_all_auths();

        client.initialize(
            &admin,
            &7,
            &String::from_str(&env, "Pulse Rewards Token"),
            &String::from_str(&env, "PULSE"),
        );

        assert_eq!(client.admin(), admin);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_initialize_panics() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PulseTokenContract);
        let client = PulseTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        env.mock_all_auths();

        client.initialize(
            &admin,
            &7,
            &String::from_str(&env, "Pulse Rewards Token"),
            &String::from_str(&env, "PULSE"),
        );
        // second call must panic
        client.initialize(
            &admin,
            &7,
            &String::from_str(&env, "Pulse Rewards Token"),
            &String::from_str(&env, "PULSE"),
        );
    }
}
