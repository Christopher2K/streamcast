import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    plugins: [
      tsconfigPaths({
        root: import.meta.dirname,
      }),
    ],
  },
});
