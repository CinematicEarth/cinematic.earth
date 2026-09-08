/*
 * Copyright (C) 2025 Garrett Brown
 * This file is part of lakotaloop.stream - https://github.com/LakotaLoop/lakotaloop.stream
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * See the file LICENSE.txt for more information.
 */

import { defineConfig } from "vite";

// The app uses plain HTML and TypeScript; no UI renderer plugins are needed.

export default defineConfig({
  // Base path for all assets in production. Change this to "/myApp/" if the
  // site is deployed under a subdirectory.
  base: "/",

  server: {
    headers: {
      // Required to enable SharedArrayBuffer and other security-sensitive
      // browser features. Both headers are needed for proper isolation.
      "Cross-Origin-Opener-Policy": "same-origin",
      // Use `credentialless` so the demo video can be fetched without CORS
      // or Cross-Origin-Resource-Policy headers.
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
});
