---
"@allons-y/markdown-it-anchor-sections": minor
---

Generate section ids from the full heading text, so links from a table of contents land on the right section. Headings with inline formatting keep their word spacing (`## Hello *big* world` is `hello-big-world`), accents & non-Latin text are percent-encoded instead of dropped, & duplicate headings get `-1`, `-2` suffixes. An id set on the heading itself (for example `{#intro}` with `markdown-it-attrs`) takes precedence & moves to the section; an id is generated only when the heading has none. Pass a `slugify` option to use your own. Ids for headings containing punctuation or non-ASCII characters change, so update any links that relied on the old ones.
