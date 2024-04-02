import { createStore } from "solid-js/store";
import { useNavigate } from "@solidjs/router";

import { Heading } from "#root/components/park/heading";
import { Input } from "#root/components/park/input";
import { Button } from "#root/components/park/button";
import { Text } from "#root/components/park/text";
import { VStack, Box } from "#style/jsx";
import { vstack } from "#style/patterns";
import { createRoom } from "#root/services/api";

type FormData = {
  name: string;
};

type FormState = {
  loading: boolean;
};

export function CreateRoomForm() {
  const [formData, setFormData] = createStore<FormData>({
    name: "",
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
    const room = await createRoom(formData.name);
    setFormState("loading", false);
    navigate("/app/room/" + room.id);
  }

  return (
    <VStack justifyContent="flex-start" alignItems="flex-start">
      <Heading as="h2" size="xl">
        Create new room
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
          <Text as="label" for="room">
            Room name
          </Text>
          <Input
            placeholder="e.g. Cantina"
            name="room"
            type="text"
            onChange={onChange("name")}
            value={value("name")}
          />
        </Box>

        <Button type="submit" disabled={formState.loading}>
          Create
        </Button>
      </form>
    </VStack>
  );
}
