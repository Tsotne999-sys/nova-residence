# NOVA Residence — Cinematic 3D Architectural Concept

## Overview

An independent fictional architectural concept and portfolio project set in Batumi, Georgia. NOVA Residence explores vertical architecture, material, light and the Black Sea horizon through a cinematic browser experience.

## Experience

Native scrolling drives a real-time 3D tower and camera journey through Arrival, Emergence, Ascent, Residences, Shared spaces, Horizon, Batumi and Return. The camera approaches a recessed entrance and continues through one modeled residence toward the glazing. Backward scrolling reverses the same authored sequence.

The approved doorway transition briefly darkens to conceal a handoff between exterior and interior coordinates. It is a representative residence journey rather than a physically continuous route between floors. The interactive tower and room remain real 3D; photographs do not replace their camera movement.

## Technology

- Next.js App Router, React and TypeScript
- Three.js and React Three Fiber
- GSAP ScrollTrigger for native-scroll chapter progress
- Procedural tower geometry, merged interior meshes, shared materials and lightweight surface shaders
- CSS typography and responsive layouts; compressed WebP scene captures for fallbacks

## Performance / fallbacks

Rendering runs on demand and settles when idle. Repeated tower elements are instanced and interior solids are merged by material. Pixel ratio is capped: Standard uses 1.25 outside and 1 inside with antialiasing; Lite uses 1 with simpler geometry and no MSAA. There is no bloom dependency, volumetric fog, live reflection pass or per-window lighting.

Lite is selected initially on small/coarse-pointer devices. Reduced-motion and WebGL-failure modes retain the story with architectural stills. The interactive view can be retried from View options. Pointer response is restrained and disabled during the approach/interior, in Lite and for reduced motion.

Short local samples on integrated AMD Radeon graphics measured approximately 60 fps outside and inside in Standard/Lite at 1440×1000. These are measurements, not device guarantees; a physical iPhone 12 validation remains outside the desktop portrait test.

## Running locally

Use Node.js 24 and pnpm 9 or later. The committed `pnpm-lock.yaml` pins dependencies. No credentials or environment variables are required.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:4174/`.

For validation and a production preview:

```sh
pnpm typecheck
node scripts/check-geometry.mjs
node scripts/check-narrative.mjs
node scripts/check-journey.mjs
pnpm build
pnpm start
```

Do not run the development server and a production build against the same `.next` directory simultaneously. No lint script is currently configured.

The optional `/?review=1` view exposes rendering diagnostics and a deliberate WebGL recovery test. `/study` retains the Day/Night material study; `/capture` provides scene captures used for fallback assets.

## Project status

The current visual experience and camera choreography are approved and frozen. Release preparation is local only; the project has not been deployed or pushed to GitHub. The `/presentation` destination remains an explicitly labeled preparation page.

Development included AI-assisted implementation and generated fictional spatial illustrations. This repository does not claim that every part was manually authored.

## Disclaimer

**This is a fictional architectural concept and is not a real property offering.**

NOVA Residence is a working project name. Architecture, residences and spatial studies are conceptual and do not represent an actual development, address, inventory or sales service.

