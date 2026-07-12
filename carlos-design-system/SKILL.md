---
name: carlos-design
description: Use this skill to generate well-branded interfaces and assets for CarlOS (retro Win9x-style personal website), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key rules (see README for detail):
- Everything is a Win9x window on a teal radial desktop; bevels `#fff #404040 #404040 #fff`, hard offset shadows, radius 0.
- Font `jgs9` (assets/jgs9.ttf) for all UI; monospace for terminal/logs. Spanish copy, playful, filesystem metaphors (`reproductor.exe`, `visitas.log`).
- Emoji as system icons in titlebars; service logos from assets/logos/ tinted white over brand-color squares.
- Animations are mechanical: linear marquee, steps() cursor blink. No fades.
