import { Match, Switch } from "solid-js";
import { useRoomContext } from "./roomProvider";

export function RoomView() {
  const roomCtx = useRoomContext();

  return (
    <Switch>
      <Match when={roomCtx.state.room === undefined}>Loading</Match>
      <Match when={roomCtx.state.room === null}>This room doesn't exit</Match>
      <Match when={roomCtx.state.room}>Render the room</Match>
    </Switch>
  );
}
