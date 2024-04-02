import { VStack } from "#style/jsx";
import { CreateRoomForm } from "#root/domain/room/createRoomForm";
import { JoinRoomForm } from "#root/domain/room/joinRoomForm";

export default function AppDashboard() {
  return (
    <VStack
      w="full"
      justifyContent="flex-start"
      alignItems="flex-start"
      px="10"
    >
      <CreateRoomForm />
      <JoinRoomForm />
    </VStack>
  );
}
