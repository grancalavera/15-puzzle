///<reference types="vitest/config" />
import { resolve } from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  test: {
    globals: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        svg: resolve(__dirname, "svg/index.html"),
      },
    },
  },
});
