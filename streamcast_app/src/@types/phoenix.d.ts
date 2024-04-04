type Channel = import("phoenix").Channel;
type PushStatus = import("phoenix").PushStatus;
type Push = import("phoenix").Push;

declare interface TypeSafeJoinPush<RECEIVE> extends Push {
  receive(status: PushStatus, callback: (response: RECEIVE) => any): this;
}

declare interface TypeSafeChannel<
  IN extends Record<string, unknown>,
  OUT extends Record<string, {}>,
  JOIN = undefined,
> extends Channel {
  on<NAME extends Exclude<keyof IN, number | symbol>>(
    event: NAME,
    callback: (data: IN[NAME]) => void,
  ): ReturnType<Channel["on"]>;

  push<NAME extends Exclude<keyof OUT, number | symbol>>(
    event: NAME,
    payload: OUT[NAME],
    timeout?: number,
  ): ReturnType<Channel["push"]>;

  join(): TypeSafeJoinPush<JOIN>;
}
