import { MetaProvider, Title } from "@solidjs/meta";
import { A, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "#root/app.css";
import { VStack, styled } from "#style/jsx";
import { css } from "#style/css";
import { hstack } from "#style/patterns";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Streamcast App</Title>
          <Suspense>
            <VStack
              // @ts-expect-error
              as="main"
              class={css({
                w: "full",
                minHeight: "100svh",
              })}
            >
              <styled.nav
                class={hstack({
                  w: "full",
                  h: "78px",
                  backgroundColor: "neutral.50",
                  px: "10",
                })}
              >
                <A href="/" class={css({ textStyle: "2xl" })}>
                  StreamCast
                </A>
              </styled.nav>
              {props.children}
            </VStack>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
