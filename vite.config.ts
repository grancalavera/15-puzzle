///<reference types="vitest/config" />

import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  test: {
    globals: true,
  },
});
