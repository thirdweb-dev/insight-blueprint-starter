import { EventsSource } from "./internal/EventsSource.js";
import { TransactionsSource } from "./internal/TransactionsSource.js";

/**
 * The `Source` class serves as the main entry point for accessing data sources.
 * It provides properties to access various data sources like events and transactions
 * and is the recommended way to interact with the data sources.
 *
 * Example usage:
 *
 * ```typescript
 * import { Source } from "./Source.js";
 *
 * const source = new Source();
 * const events = await source.events.get(chainId, options);
 * ```
 */
export class Source {
  public events: EventsSource;
  public transactions: TransactionsSource;

  constructor() {
    this.events = new EventsSource();
    this.transactions = new TransactionsSource();
  }
}
