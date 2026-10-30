# JIRO — Frozen Studio

[![Build](https://github.com/jiro-scopee-dev/frozen-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/jiro-scopee-dev/frozen-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A continuous scroll-driven 3D world built with Three.js. Scroll to orbit a snowy sanctuary, dismantle its blocks, travel through a ring tunnel, and arrive among three detailed iceberg studies. A fifth chapter assembles Instagram, LinkedIn, and X marks from 5,400 GPU-driven particles. Scrolling backward reverses the sequence.

A continuous scroll-driven world inspired by the supplied Igloo recording. Scroll to orbit a snowy sanctuary, dismantle its blocks, travel through a ring tunnel, and arrive among three detailed iceberg studies. A fifth chapter assembles Instagram, LinkedIn, and X marks from 5,400 GPU-driven particles. Scrolling backward reverses the sequence. Custom GLSL material extensions provide frost, fractures, relief, strata, and variation in ice roughness. Built with Three.js, procedural geometry, CSS, and native browser controls. No paid assets or API keys are needed. Social marks are visual only until actual profile destinations are supplied.

## Run

Run `npm install`, `npm run build`, and `npm run dev` from this folder. Open http://127.0.0.1:4173.

The `dist` folder is the finished static website and can be served by any static host. Opening index.html directly from disk is not supported; use a web server.

## Personalize

Edit `src/journey.js` for the projects, manifesto, camera path, scroll choreography, and procedural world. Edit `dist/index.html` for base interface and dialog copy. Edit `dist/journey.css` for world overlays, and `dist/style.css` for shared typography. Rebuild after changing JavaScript. `src/main.js` preserves the earlier sculpture-viewer implementation and is not the build entry point.

The three studies are explicitly illustrative concepts, not claims about completed client work. Contact and social destinations were not supplied and are not fabricated.

## Controls

Scale/motion refinement: glaciers are approximately 1.5–2 times larger, framed farther to the right on desktop. Vertical handoffs now use continuous quintic interpolation across longer scroll intervals, with stable stops for all three studies. Camera entry/exit uses slower damping and the same smooth start/stop curve. The glacier-motion self-check verifies travel continuity, reversibility, and study stops.

The igloo now emits a cool glow with Fresnel rims. The project collection presents three glass-like glaciers individually in a vertical scroll sequence. Each contains a glowing identity symbol. Click the glacier or use **Enter the glacier** to move the camera inside, view the project in an icy interior, and use Close or Escape to reverse the camera move without losing your place. Reduced-motion mode switches directly to the interior view.

- Scroll naturally with a mouse wheel, trackpad, touch, Page Down, or arrow keys to travel. The chapter arrow buttons and Left/Right keys jump to nearby chapters.
- Scroll backward to reconstruct the world.
- At the destination, click a sculpture or study title to open its details; Escape or Close returns to the same world position.
- About opens the personal statement.
- Sound toggles synthesized ambient wind. Audio begins only after user interaction.
- System reduced-motion preferences use stable chapter views and suppress the continuous camera flight, flash, and idle motion.

## Verification

Glacier-entry revision: production build, glass-material and embedded-symbol checks, and snow-block checks passed. Browser checks confirmed the individual glacier, visible icon, click-to-enter camera movement, project interior, and Close return flow; no browser errors were reported. This also verified the atmosphere pipeline that could not be viewed during the earlier revision. Phone hardware performance remains untested.

Latest atmosphere update: added shader-based hemisphere shading, Fresnel rims, scroll-driven mist, a five-octave swirling cloud tunnel, and an EffectComposer → RenderPass → UnrealBloomPass → OutputPass pipeline. Bloom increases during the tunnel and is restrained elsewhere. Rendering resolution is capped more aggressively on phones. Reduced-motion preferences hold the clouds still and remove the bloom pulse. The updated production build and shader-injection checks pass. Browser preview access was unavailable for this final atmosphere revision, so its visual balance still needs a live check; the earlier desktop/mobile checks below predate bloom.

Production bundle built successfully. Desktop and 390 × 844 mobile previews were visually checked, including the new particle-logo finale. Iceberg geometry and material shader injection checks passed, and the browser reported no shader errors. Reversible chapter navigation and project details were checked. Audio playback and real-device performance were not independently verified.

Procedural sculptures interpret the reference; the original site's proprietary models and shaders are not included. Google Fonts supplies the optional web fonts; system fallbacks remain available offline.
