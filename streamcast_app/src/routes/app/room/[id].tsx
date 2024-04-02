import { useParams } from "@solidjs/router";
import { RoomProvider } from "#root/domain/room/roomProvider";
import { RoomView } from "#root/domain/room/roomView";

export default function RoomPage() {
  const { id } = useParams();

  return (
    <RoomProvider roomId={id}>
      <RoomView />
    </RoomProvider>
  );
}
