import { ParentProps, createContext, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import type { User } from "./types";

export type AuthState = {
  user?: null | User;
};

export type AuthComputed = {
  isReady: boolean;
};

export type AuthActions = {
  onLogin: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<{ state: AuthState } & AuthActions>();

export function AuthProvider(props: ParentProps) {
  const [state, setState] = createStore<AuthState>({});

  function onLogin(user: User) {
    setState("user", user);
    localStorage.setItem("@user", JSON.stringify(user));
  }

  function logout() {
    setState("user", null);
    localStorage.removeItem("@user");
  }

  onMount(() => {
    const mbUser = localStorage.getItem("@user");
    if (!mbUser) {
      setState("user", null);
    } else {
      const loggedUser = JSON.parse(mbUser) as User;
      setState("user", loggedUser);
    }
  });

  return (
    <AuthContext.Provider
      value={{
        state,
        onLogin,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("<AuthProvider /> is missing in the tree");
  return authContext;
}
