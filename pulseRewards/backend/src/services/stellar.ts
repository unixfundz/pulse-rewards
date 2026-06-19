import {
  Horizon,
  Keypair,
  Asset,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { logger } from '../utils/logger';

const NETWORK = process.env.STELLAR_NETWORK ?? 'testnet';
const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL ??
  (NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org');
const NETWORK_PASSPHRASE = NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

export class StellarService {
  private readonly server: Horizon.Server;
  private readonly pulseAsset: Asset;

  constructor() {
    this.server = new Horizon.Server(HORIZON_URL);
    this.pulseAsset = new Asset(
      'PULSE',
      process.env.ISSUER_PUBLIC ?? ''
    );
  }

  async getPulseBalance(address: string): Promise<string> {
    const account = await this.server.loadAccount(address);
    const balance = account.balances.find(
      (b) =>
        b.asset_type !== 'native' &&
        (b as Horizon.HorizonApi.BalanceLineAsset).asset_code === 'PULSE' &&
        (b as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === process.env.ISSUER_PUBLIC
    );
    return balance?.balance ?? '0';
  }

  async getRecentTransactions(address: string) {
    const { records } = await this.server
      .transactions()
      .forAccount(address)
      .order('desc')
      .limit(20)
      .call();
    return records.map((tx) => ({
      id: tx.id,
      hash: tx.hash,
      created_at: tx.created_at,
      successful: tx.successful,
    }));
  }

  async transferPulseToken(destinationAddress: string, amount: string): Promise<string> {
    const distributionSecret = process.env.DISTRIBUTION_SECRET;
    const distributionPublic = process.env.DISTRIBUTION_PUBLIC;
    if (!distributionSecret || !distributionPublic) {
      throw new Error('Distribution keypair not configured');
    }

    const distributionKeypair = Keypair.fromSecret(distributionSecret);
    const sourceAccount = await this.server.loadAccount(distributionPublic);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: this.pulseAsset,
          amount,
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(distributionKeypair);
    const result = await this.server.submitTransaction(tx);
    logger.info('PULSE transfer submitted', { hash: result.hash, destination: destinationAddress, amount });
    return result.hash;
  }
}
