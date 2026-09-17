# Only for Human desktop builder

Approved direction: a deliberately ordinary human image archive under a shared five-year apocalypse countdown. The premise is a joke, not a forecast. No quality voting, AI-generated illustrations, videos, identity gate, or SaaS dashboard.

Primary screen is a single masonry feed with pixel countdown and Leave something action. Secondary screens: upload, item detail, saved, profile. Desktop first, 1440px. English default; Korean toggle. User captions remain in their original language.

GitHub is the source of screen JSON, tokens, translations and one fixed UTC deadline. Plugin loads a manifest then all resources pinned to the same Git commit. Routine JSON changes do not need another ZIP. Renderer/schema changes may require installing an updated plugin.

New dedicated repository: kovemu/only-for-human-builder. Existing aipro data is read-only reference. It has the sync contract but no renderer source in main; this builder implements its own declarative renderer.

Figma generates editable text/rectangle layers. Placeholder image slots are explicitly marked until user-supplied photographs/drawings are provided. No simulated user uploads. Countdown updates each minute while the plugin is open; closed Figma canvases are static. A future website must run its own timer.

Only managed OFH frames on the current page are replaced, after new frames finish successfully. Failed fetches do not destroy existing screens. Local bundled data permits offline generation. UI buttons in the design are visual only; authentication/upload/storage are outside this builder.

Deadline is fixed at 2031-09-17T17:51:00Z, five calendar years after 2026-09-17T17:51:00Z. It never resets on load and clamps to zero after expiry.
