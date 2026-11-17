# Changelog

## 1.1.0

📅 _Released 17 November 2026_

### Minor Changes

- Name each section by its heading. The section now has `aria-labelledby`, & the heading gets an id of the section's id plus `-heading` for it to point at, so assistive technology exposes every section as a named `region` landmark. Update any script or style that expects the heading itself to have the section's id. (📝 [#18](https://github.com/allonsy-studio/markdown-it-anchor-sections/pull/18))
- Generate section ids from the full heading text, so links from a table of contents land on the right section. Headings with inline formatting keep their word spacing (`## Hello *big* world` is `hello-big-world`), accents & non-Latin text are percent-encoded instead of dropped, & duplicate headings get `-1`, `-2` suffixes. An id set on the heading itself (for example `{#intro}` with `markdown-it-attrs`) takes precedence & moves to the section; an id is generated only when the heading has none. Pass a `slugify` option to use your own. Ids for headings containing punctuation or non-ASCII characters change, so update any links that relied on the old ones. (📝 [#16](https://github.com/allonsy-studio/markdown-it-anchor-sections/pull/16))

## 1.0.1 (2026-04-21)

### 🐛 Bug Fixes

- **docs:**update readme with more details; fix inaccurate demo ([e96946b]())

## 1.0.0 (2026-04-20)

### ✨ Features

\*initial commit of markdown-it-anchor-sections ([21ce354](https://github.com/castastrophe/markdown-it-anchor-sections/commit/21ce354d8a66bba7741de34d8b4331c243bc6487))

A markdown-it plugin for wrapping markdown content in `<section>` tags automatically, grouped by header level, and hoisting or creating an anchor tag on the section; perfect for Intersection Observers, scroll-spying, or semantic styling without manual markup.
