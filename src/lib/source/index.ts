/**
 * The main entry point for the sources library.
 * Exports the `Source` class and related types.
 */

export { Source } from "./Source.js";
export type {
  SourceResponse,
  SourceAggregatedResponse,
} from "./internal/BaseSource.js";
export type { Event } from "./internal/EventsSource.js";
export type { Transaction } from "./internal/TransactionsSource.js";

// Include any other types you wish to expose
