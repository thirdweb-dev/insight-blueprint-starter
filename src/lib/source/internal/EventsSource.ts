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

export type EventFields = {
  chain_id: number;
  block_number: number;
  block_hash: string;
  block_timestamp: number;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  address: string;
  data: string;
  topic_0: string;
  topic_1: string | null;
  topic_2: string | null;
  topic_3: string | null;
};

export type Event = Omit<
  EventFields,
  "topic_0" | "topic_1" | "topic_2" | "topic_3"
> & {
  topics: string[];
};

type EventFilters = {
  [key in keyof Omit<EventFields, "chain_id">]?: Filter | Filter[];
};

/**
 * @internal
 *
 * The `EventsSource` class extends `BaseSource` to provide methods specific to event data.
 * It is used internally by the `Source` class and should not be instantiated directly.
 *
 * Use the `source.events` property from the public `Source` class to access event data.
 */
export class EventsSource
  extends BaseSource<EventFilters, Event>
  implements ISource<EventFilters, Event>
{
  async get(
    chainId: string,
    options?: QueryOptions<EventFilters, Event>,
  ): Promise<SourceResponse<Event>> {
    const queryParams = this.convertToQueryParams(options);
    return this.fetch<SourceResponse<Event>>(chainId, "events", queryParams);
  }

  async getAggregated<R extends SourceData>(
    chainId: string,
    options?: AggregationQueryOptions<EventFilters, R>,
  ): Promise<SourceAggregatedResponse<R>> {
    const queryParams = this.convertToQueryParams(options);
    return this.fetch<SourceAggregatedResponse<R>>(
      chainId,
      "events",
      queryParams,
    );
  }
}
