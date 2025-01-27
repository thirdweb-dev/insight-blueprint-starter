import type { Event, SourceResponse } from "../source/index.js";
import type { Transformation } from "./Transformation.js";

export class CombineEventsTransformation
  implements Transformation<SourceResponse<Event>[], Event[]>
{
  async transform(data: SourceResponse<Event>[]): Promise<Event[]> {
    const events = data.flatMap((response) => response.data);
    const orderedEvents = events.sort(
      (a, b) => b.block_timestamp - a.block_timestamp,
    );
    return orderedEvents;
  }
}
