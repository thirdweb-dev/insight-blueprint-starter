import {
  type AggregationQueryOptions,
  BaseSource,
  type Filter,
  type ISource,
  type QueryOptions,
  type SourceAggregatedResponse,
  type SourceData,
  type SourceResponse,
} from "./BaseSource.js";

export type Transaction = {
  chain_id: number;
  hash: string;
  nonce: number;
  block_hash: string;
  block_number: number;
  block_timestamp: number;
  transaction_index: number;
  from_address: string;
  to_address: string;
  value: string;
  gas: number;
  gas_price: string;
  data: string;
  function_selector: string;
  max_fee_per_gas: string;
  max_priority_fee_per_gas: string;
  transaction_type: number;
  r: string;
  s: string;
  v: string;
  access_list: string | null;
  contract_address: string | null;
  gas_used: number | null;
  cumulative_gas_used: number | null;
  effective_gas_price: string | null;
  blob_gas_used: number | null;
  blob_gas_price: string | null;
  logs_bloom: string | null;
  status: number | null;
};

type TransactionFilters = {
  [key in keyof Omit<Transaction, "chain_id">]?: Filter | Filter[];
};

/**
 * @internal
 *
 * The `TransactionsSource` class extends `BaseSource` to provide methods specific to transaction data.
 * It is used internally by the `Source` class and should not be instantiated directly.
 *
 * Use the `source.transactions` property from the public `Source` class to access transaction data.
 */
export class TransactionsSource
  extends BaseSource<TransactionFilters, Transaction>
  implements ISource<TransactionFilters, Transaction>
{
  async get(
    chainId: string,
    options?: QueryOptions<TransactionFilters>,
  ): Promise<SourceResponse<Transaction>> {
    const queryParams = this.convertToQueryParams(options);
    return this.fetch<SourceResponse<Transaction>>(
      chainId,
      "transactions",
      queryParams,
    );
  }

  async getAggregated<R extends SourceData>(
    chainId: string,
    options?: AggregationQueryOptions<TransactionFilters, R>,
  ): Promise<SourceAggregatedResponse<R>> {
    const queryParams = this.convertToQueryParams(options);
    return this.fetch<SourceAggregatedResponse<R>>(
      chainId,
      "transactions",
      queryParams,
    );
  }
}
