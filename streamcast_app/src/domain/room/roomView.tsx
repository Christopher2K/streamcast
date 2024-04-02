import { Match, Switch } from "solid-js";
import { Socket } from "phoenix";

import { Room } from "#root/services/api";

import { useRoomContext } from "./roomProvider";
import { useAuthContext } from "../auth/authProvider";
import { User } from "../auth/types";

export function RoomView() {
  const roomCtx = useRoomContext();
  const authCtx = useAuthContext();

  return (
    <Switch>
      <Match when={roomCtx.state.room === undefined}>Loading</Match>
      <Match when={roomCtx.state.room === null}>This room doesn't exit</Match>
      <Match when={roomCtx.state.room}>
        {(room) => <ActiveRoom room={room()} user={authCtx.state.user!} />}
      </Match>
    </Switch>
  );
}

type ActiveRoomProps = {
  room: Room;
  user: User;
};

function ActiveRoom(props: ActiveRoomProps) {
  const socket = new Socket("ws://localhost:4000/socket/room", {
    params: { userId: props.user.id },
  });
  socket.connect();
  const channel = socket.channel("room:" + props.room.id);
  channel.join().receive("ok", (_) => {
    console.log("Joined the room:" + props.room.id);
  });
  channel.on("presence:joined", (e) => console.log("joined", e));
  channel.on("presence:left", (e) => console.log("left", e));

  return null;
}
