<!--
Copyright (C) 2026 Garrett Brown
This file is part of cinematic.earth - https://github.com/CinematicEarth/cinematic.earth

SPDX-License-Identifier: AGPL-3.0-or-later
See the file LICENSE.txt for more information.
-->

# Icon artwork

The app identity combines a turquoise Earth, a cinema lens, and a golden sunrise on an opaque midnight navy background. Artwork was created with the built-in image generator. The social composition uses the generated icon as its reference.

All deliverables live in `public/assets/`:

- `icon-48x48.png`: browser favicon.
- `icon-180x180.png`: Apple home-screen icon.
- `icon-192x192.png` and `icon-512x512.png`: standard app icons.
- `icon-maskable-512x512.png`: app icon with additional padding for launcher masks.
- `icon-1200x1200.png`: square social-sharing artwork with the wordmark and description.

The icons have full-bleed opaque backgrounds and no baked-in rounded corners. The maskable version resizes the generated square to 480px and extends its edges by 16px on each side, keeping the globe and lens within the centered 80%-diameter safe circle. Final PNGs use Lanczos downsampling; metadata is stripped to reduce file size. Social metadata in `index.html` declares the square composition's actual dimensions.

## Icon generation prompt

Use case: logo-brand. Create a brand-new premium home-screen app icon for cinematic.earth, an Earth cinematography web app. Square 1536px artwork, full-bleed opaque midnight navy background, no rounded outer corners. One bold centered sculptural Earth globe, teal oceans and simplified recognizable pale turquoise continents, luminous warm sunrise rim, with a subtle circular cinema-lens surround. Elegant dimensional illustration, restrained glow, exceptional optical clarity at 48px. Globe and all essential artwork contained within the central 72% of the square, ample clean dark padding. Rich yet refined, memorable, beautifully balanced. No text, no stars, no extra objects, no borders, no mockup.

## Social generation prompt

Use case: logo-brand. Create the matching square social-sharing artwork for cinematic.earth from this reference icon. Preserve the same recognizable Earth-in-a-cinema-lens design, turquoise oceans, pale continents, golden sunrise at upper right, and midnight navy palette. Recompose as an exquisite cinematic poster: the luminous globe/lens centered in the upper two thirds with comfortable negative space; below it, beautifully typeset warm-white editorial serif wordmark exactly 'cinematic.earth', and a smaller clean sans-serif line exactly 'Stunning earth cinematography'. Restrained atmospheric illumination, polished premium finish, exceptional typography. Keep all artwork/text comfortably within the canvas, readable when reduced. Full-bleed opaque square, at least 1200px. No rounded corners, no mockup, no extra text.

## Social subtitle correction prompt

Use case: text-localization. Edit only the small subtitle at the bottom of this social-sharing image: replace 'Stunning earth cinematography' with exactly 'Stunning Earth cinematography'. Capital E in Earth; Stunning is spelled S-t-u-n-n-i-n-g. Preserve the subtitle font, size, letter spacing, alignment, and color. Preserve the globe, lens, sunrise, background, the lowercase cinematic.earth wordmark, composition, and all other pixels as closely as possible. Square opaque output at least 1200px.
