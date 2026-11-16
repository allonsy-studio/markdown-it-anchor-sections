---
"@allons-y/markdown-it-anchor-sections": minor
---

Name each section by its heading. The section now has `aria-labelledby`, & the heading gets an id of the section's id plus `-heading` for it to point at, so assistive technology exposes every section as a named `region` landmark. Update any script or style that expects the heading itself to have the section's id.
