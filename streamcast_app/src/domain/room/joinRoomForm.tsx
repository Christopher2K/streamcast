import { createStore } from "solid-js/store";
import { useNavigate } from "@solidjs/router";

import { Heading } from "#root/components/park/heading";
import { Input } from "#root/components/park/input";
import { Button } from "#root/components/park/button";
import { Text } from "#root/components/park/text";
import { VStack, Box } from "#style/jsx";
import { vstack } from "#style/patterns";
import { getRoom } from "#root/services/api";

type FormData = {
  roomId: string;
};

type FormState = {
  loading: boolean;
};

export function JoinRoomForm() {
  const [formData, setFormData] = createStore<FormData>({
    roomId: "",
  });
  const [formState, setFormState] = createStore<FormState>({
    loading: false,
  });
  const navigate = useNavigate();

  function onChange(field: keyof FormData) {
    return (event: { target: HTMLInputElement }) => {
      setFormData(field, event.target.value);
    };
  }

  function value(field: keyof FormData) {
    return formData[field];
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    setFormState("loading", true);
    const room = await getRoom(formData.roomId);
    setFormState("loading", false);
    navigate("/app/room/" + room.id);
  }

  return (
    <VStack justifyContent="flex-start" alignItems="flex-start">
      <Heading as="h2" size="xl">
        Join an existing room
      </Heading>

      <form
        onSubmit={onSubmit}
        class={vstack({
          justifyContent: "flex-start",
          alignItems: "flex-start",
          maxWidth: "500px",
          width: "full",
          gap: "4",
        })}
      >
        <Box width="full">
          <Text as="label" for="roomId">
            Room identifier
          </Text>
          <Input
            placeholder="Long ass UUID"
            name="roomId"
            type="text"
            onChange={onChange("roomId")}
            value={value("roomId")}
          />
        </Box>

        <Button type="submit" disabled={formState.loading}>
          Join
        </Button>
      </form>
    </VStack>
  );
}
