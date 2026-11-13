# markdown-it-anchor-sections

A markdown-it plugin that wraps each heading and everything under it in a `<section>`,
closing when the next heading of the same level arrives. The point is to give
intersection observers a real element to watch, so a page can tell which section is
on screen.

## Toolchain

Node >= 24 (`nvm use`), Yarn 4, ESM only. Tabs for indentation, width 4. Prettier
and ESLint own formatting, and husky + lint-staged run them on commit. Don't bypass
with `--no-verify`.

## Commands

```sh
yarn install
yarn test        # runs test.js directly under node
yarn coverage    # c8 over the same suite
```

## Conventions

- `index.js` is the whole plugin; `test.js` is the whole suite. New behavior needs a
  case in `test.js`.
- Keep code self-documenting. When a comment is warranted, keep it brief and explain
  only the *why* the code can't show; never restate what the code does.
- Releases run through `opx release` on `main`. Add a changeset (`yarn changeset`) for
  any change a user would notice; its summary becomes the changelog entry, so write it
  for a human reader. The commit type no longer sets the version.

## Commits and pull requests

Conventional Commits, enforced by commitlint: `<type>(<optional-scope>): <imperative
subject>`, lowercase, no trailing period. See `CONTRIBUTING.md` for the full
contributor flow.

Never add AI attribution to a commit or a PR: no `Co-Authored-By` trailer, no
"Generated with …" footer, no session URLs.

## Prose style

Prose in this repo (README, commit bodies, PR descriptions) follows the
[studio style guide](https://github.com/allonsy-studio/.github/blob/main/AGENTS.md#style-guide):
sentence-case headings, `&` over "and", `:` over em dashes.
