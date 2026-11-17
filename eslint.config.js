import js from "@allons-y/opx-lint-js/eslint.config.js";
import md from "@allons-y/opx-lint-md/eslint.config.js";

export default [
	...js,
	...md,
	{
		ignores: [
			// Changesets writes this file on every release.
			"CHANGELOG.md",
			// Owned by the docs scaffold: edits are overwritten on `--update`.
			"docs/cypress.config.js",
			"docs/cypress/**",
		],
	},
];
