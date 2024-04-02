import { ParentProps, createContext, createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { Room, getRoom } from "#root/services/api";

type RoomState = {
  room?: null | Room;
};

const RoomContext = createContext<{
  state: RoomState;
}>();

type RoomProviderProps = ParentProps<{ roomId: string }>;

export function RoomProvider(props: RoomProviderProps) {
  const [state, setState] = createStore<{
    room?: null | Room;
  }>({});

  createEffect(async () => {
    try {
      const room = await getRoom(props.roomId);
      setState("room", room);
    } catch (e) {
      setState("room", null);
    }
  });

  return (
    <RoomContext.Provider
      value={{
        state,
      }}
    >
      {props.children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context)
    throw new Error("<RoomProvider /> cannot be seen in the render tree");

  return context;
}
