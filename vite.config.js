/*
 * Copyright (C) 2026 Garrett Brown
 * This file is part of cinematic.earth - https://github.com/CinematicEarth/cinematic.earth
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
});
