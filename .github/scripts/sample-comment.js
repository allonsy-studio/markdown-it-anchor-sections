// Renders a sample through the PR's plugin & writes the PR comment body.
// Usage: node sample-comment.js <out-file> <preview-url> [base-index.js]
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";

const [, , outFile, previewUrl, baseIndex] = process.argv;

const sample = `# Introduction {.lede}

Hello world.

## Details

More info here.

## Details

Duplicate headings are numbered.
`;

/**
 * Render the sample with a copy of the plugin.
 * @param {string} file
 * @returns {Promise<string>}
 */
async function render(file) {
	const { default: plugin } = await import(pathToFileURL(path.resolve(file)).href);
	return markdownIt().use(markdownItAttrs).use(plugin).render(sample);
}

/**
 * Unified diff of two strings.
 * @param {string} before
 * @param {string} after
 * @returns {string}
 */
function diff(before, after) {
	const dir = mkdtempSync(path.join(tmpdir(), "sample-"));
	writeFileSync(path.join(dir, "base.html"), before);
	writeFileSync(path.join(dir, "pr.html"), after);
	const { stdout } = spawnSync("git", ["diff", "--no-index", "--no-color", "-U2", "base.html", "pr.html"], {
		cwd: dir,
		encoding: "utf8",
	});
	return stdout.split("\n").slice(4).join("\n").trim();
}

const html = await render("index.js");

let changes = "No change in the sample output against the base branch.";
if (baseIndex) {
	const delta = diff(await render(baseIndex), html);
	if (delta) {
		changes = `<details>\n<summary>Output changes against the base branch</summary>\n\n\`\`\`diff\n${delta}\n\`\`\`\n\n</details>`;
	}
}

const body = `<!-- sample-comment -->
### Sample output

Markdown in:

\`\`\`md
${sample.trim()}
\`\`\`

HTML out, rendered by this PR's \`index.js\` with \`markdown-it-attrs\`:

\`\`\`html
${html.trim()}
\`\`\`

${changes}

[Preview the landing page](${previewUrl}#usage). It can take a minute or two to go live after a push.
`;

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, body);
