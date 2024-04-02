import { createStore } from "solid-js/store";
import { Input } from "#root/components/park/input";
import { Button } from "#root/components/park/button";
import { Text } from "#root/components/park/text";
import { VStack, Box } from "#style/jsx";
import { vstack } from "#style/patterns";
import { css } from "#style/css";

import { useAuthContext } from "./authProvider";
import { login } from "#root/services/api";

type FormData = {
  name: string;
};

type FormState = {
  loading: boolean;
};

export function LoginForm() {
  const [formData, setFormData] = createStore<FormData>({
    name: "",
  });
  const [formState, setFormState] = createStore<FormState>({
    loading: false,
  });
  let abortController: AbortController | null;
  const auth = useAuthContext();

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
    const user = await login(formData.name);
    setFormState("loading", false);
    auth.onLogin(user);
  }

  return (
    <VStack justifyContent="flex-start" alignItems="flex-start">
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
          <Text as="label" for="name">
            What's your name?
          </Text>
          <Input
            placeholder="John Doe"
            name="name"
            type="text"
            onChange={onChange("name")}
            value={value("name")}
          />
        </Box>

        <Button
          type="submit"
          class={css({ w: "full" })}
          disabled={formState.loading}
        >
          Login
        </Button>
      </form>
    </VStack>
  );
}
