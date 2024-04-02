import { clientOnly } from "@solidjs/start";
import { RouteSectionProps } from "@solidjs/router";

const ClientOnlyLayout = clientOnly(() => import("../layouts/AppLayout"));

export default function AppRouter(props: RouteSectionProps) {
  return <ClientOnlyLayout>{props.children}</ClientOnlyLayout>;
}
