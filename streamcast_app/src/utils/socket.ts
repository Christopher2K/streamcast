import type { Channel } from "phoenix";

export type TypeSafeChannel<IN extends Record<string, unknown>> = {
  /**
   * Base channel that we're using for the `on` wrapper
   */
  _channel: Channel;
  /**
   * Type safe wrapper around Channel.on method, to know what are the expected event
   * and what do they return
   */
  on<NAME extends Exclude<keyof IN, number | symbol>>(
    event: NAME,
    callback: (data: IN[NAME]) => void,
  ): void;
};

/**
 *  Wraps a phoenix channel to expose a `on` event type safe method
 */
export function typeSafeWrapper<IN extends Record<string, unknown>>(
  channel: Channel,
): TypeSafeChannel<IN> {
  function on<NAME extends Exclude<keyof IN, number | symbol>>(
    event: NAME,
    callback: (data: IN[NAME]) => void,
  ) {
    return channel.on(event, callback);
  }

  return {
    _channel: channel,
    on,
  };
}
