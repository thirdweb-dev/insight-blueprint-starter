import { getEnv } from "../../env.js";

export type SourceMeta = {
  chain_id: number;
  address: string;
  signature: string;
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
};

export type SourceResponse<R> = {
  meta: SourceMeta;
  data: R[];
};

export type SourceAggregatedResponse<R> = {
  meta: SourceMeta;
  aggregations: { [key: string]: R }[];
};

export type QueryOptions<
  F extends Filters = Filters,
  R extends SourceData = SourceData,
> = {
  filters?: F;
  orderBy?: {
    field: keyof (R & F) | (keyof (R & F))[];
    direction?: "asc" | "desc";
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
};

export type AggregationQueryOptions<
  F extends Filters,
  R extends SourceData,
> = QueryOptions<F, R> & {
  groupBy?: keyof R | (keyof R)[];
  aggregation: string | string[];
};

export interface ISource<F extends Filters, R extends SourceData> {
  get(
    chainId: string,
    options?: QueryOptions<F, R>,
  ): Promise<SourceResponse<R>>;

  getAggregated<T extends SourceData>(
    chainId: string,
    options?: AggregationQueryOptions<F, T>,
  ): Promise<SourceAggregatedResponse<T>>;
}

export type FilterOperator = "gte" | "gt" | "lte" | "lt" | "ne" | "in";
export type FilterValue = string | number | boolean;
export type Filter =
  | FilterValue
  | {
      operator: Exclude<FilterOperator, "in">;
      value: FilterValue;
    }
  | {
      operator: "in";
      value: FilterValue | FilterValue[];
    };
export type Filters = {
  [key: string]: Filter | Filter[];
};

export type SourceData = {
  [key: string]: unknown;
};

type QueryParams = Map<string, string[]>;

const clientId = getEnv("THIRDWEB_CLIENT_ID");

/**
 * @internal
 *
 * The `BaseSource` class provides common methods and properties for all data sources.
 * It handles fetching data from the API and converting query options to query parameters.
 *
 * This class should not be used directly. Instead, use the `Source` class provided
 * in the public API.
 */
export class BaseSource<F extends Filters, R extends SourceData> {
  protected async fetch<T>(
    chainId: string,
    path: "events" | "transactions",
    queryParams: QueryParams,
  ): Promise<T> {
    const url = new URL(
      `https://${chainId}.insight.thirdweb.com/v1/${clientId}/${path}`,
    );
    for (const [key, values] of queryParams.entries()) {
      for (const v of values) {
        url.searchParams.append(key, v);
      }
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Data source return non-200 status: ${response.status}. ${await response.text()}`,
      );
    }
    return await response.json();
  }

  protected convertToQueryParams<R2 extends SourceData = SourceData>(
    queryOptions?: QueryOptions<F, R> | AggregationQueryOptions<F, R2>,
  ): QueryParams {
    const queryParams: QueryParams = new Map<string, string[]>();
    if (queryOptions?.filters) {
      for (const [field, filter] of Object.entries(queryOptions.filters)) {
        const filtersForField = Array.isArray(filter) ? filter : [filter];
        for (const f of filtersForField) {
          const hasOperator = typeof f === "object" && "operator" in f;
          const queryParamName = hasOperator
            ? `filter_${field}_${f.operator}`
            : `filter_${field}`;
          const filterValue = hasOperator ? f.value : f;
          const queryParamValue = (
            Array.isArray(filterValue) ? filterValue.join(",") : filterValue
          ).toString();
          if (queryParams.has(queryParamName)) {
            queryParams.get(queryParamName)?.push(queryParamValue);
          } else {
            queryParams.set(queryParamName, [queryParamValue]);
          }
        }
      }
    }
    if (queryOptions?.pagination) {
      if (queryOptions.pagination.page) {
        queryParams.set("page", [queryOptions.pagination.page.toString()]);
      }
      if (queryOptions.pagination.limit) {
        queryParams.set("limit", [queryOptions.pagination.limit.toString()]);
      }
    }
    if (queryOptions?.orderBy?.field) {
      if (Array.isArray(queryOptions.orderBy.field)) {
        queryParams.set(
          "sort_by",
          queryOptions.orderBy.field.map((f) => f.toString()),
        );
      } else {
        queryParams.set("sort_by", [queryOptions.orderBy.field.toString()]);
      }
      if (queryOptions.orderBy.direction) {
        queryParams.set("sort_order", [queryOptions.orderBy.direction]);
      }
    }
    if (queryOptions && "groupBy" in queryOptions && queryOptions.groupBy) {
      if (Array.isArray(queryOptions.groupBy)) {
        queryParams.set(
          "group_by",
          queryOptions.groupBy.map((g) => g.toString()),
        );
      } else {
        queryParams.set("group_by", [queryOptions.groupBy.toString()]);
      }
    }
    if (queryOptions && "aggregation" in queryOptions) {
      if (Array.isArray(queryOptions.aggregation)) {
        queryParams.set("aggregate", queryOptions.aggregation);
      } else {
        queryParams.set("aggregate", [queryOptions.aggregation]);
      }
    }
    return queryParams;
  }
}
