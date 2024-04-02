import { useAuthContext } from "#root/domain/auth/authProvider";

import { Switch, Match } from "solid-js";
import { Navigate } from "@solidjs/router";
import { LoginForm } from "#root/domain/auth/loginForm";

export default function Login() {
  const auth = useAuthContext();

  return (
    <Switch>
      <Match when={auth.state.user === undefined}>
        <p>Loading</p>
      </Match>
      <Match when={auth.state.user === null}>
        <LoginForm />
      </Match>
      <Match when={auth.state.user}>
        <Navigate href="/app/dashboard" />
      </Match>
    </Switch>
  );
}
