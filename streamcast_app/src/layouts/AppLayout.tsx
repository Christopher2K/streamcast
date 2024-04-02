import { ParentProps } from "solid-js";

import { AuthProvider } from "#root/domain/auth/authProvider";

export default function AppLayout(props: ParentProps) {
  return <AuthProvider>{props.children}</AuthProvider>;
}
