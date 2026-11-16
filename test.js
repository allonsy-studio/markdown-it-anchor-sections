import assert from "node:assert";
import { describe, it } from "node:test";

import { minify } from "html-minifier";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import anchorSections, { slugify } from "./index.js";

const minifyOptions = { collapseWhitespace: true };

/**
 * Clean the result and expected strings for comparison.
 * @param {string} result - The result string to clean.
 * @param {string} expected - The expected string to clean.
 * @returns {void}
 */
function cleanCompare(result, expected) {
	assert.equal(minify(result, minifyOptions), minify(expected, minifyOptions));
}

const md = markdownIt().use(markdownItAttrs).use(anchorSections);

describe("markdown-it-anchor-sections", () => {
	it("should add sections to headers", () => {
		const expected = "<section id=\"header\" aria-labelledby=\"header-heading\"><h1 id=\"header-heading\">header</h1><p>lorem</p></section>";
		const result = md.render(`
# header
lorem
`);

		cleanCompare(result, expected);
	});

	it("should maintain header attributes from other plugins", () => {
		const expected = "<section id=\"header\" aria-labelledby=\"header-heading\"><h1 class=\"red\" id=\"header-heading\">header</h1><p>lorem</p></section>";
		const result = md.render(`
# header {.red}
lorem
`);

		cleanCompare(result, expected);
	});

	it("should close sections when a new header is of same or lower level", () => {
		const expected = "<section id=\"asdf\" aria-labelledby=\"asdf-heading\"><h2 id=\"asdf-heading\">asdf</h2><p>lorem</p></section><section id=\"fdsa\" aria-labelledby=\"fdsa-heading\"><h2 id=\"fdsa-heading\">fdsa</h2><p>ipsum</p></section>";
		const result = md.render(`
## asdf
lorem

## fdsa
ipsum
`);
		cleanCompare(result, expected);
	});

	it("should nest sections", () => {
		const expected = `
<section id="header-1" aria-labelledby="header-1-heading">
  <h1 id="header-1-heading">Header 1</h1>
  <p>Text.</p>
  <section id="header-2" aria-labelledby="header-2-heading">
    <h3 id="header-2-heading">Header 2</h3>
    <p>Lorem?</p>
  </section>
  <section id="header-3" aria-labelledby="header-3-heading">
    <h2 id="header-3-heading">Header 3</h2>
    <p>Ipsum.</p>
  </section>
</section>
<section id="last-header" aria-labelledby="last-header-heading">
  <h1 id="last-header-heading">Last header</h1>
  <p>Markdown rules!</p>
</section>`;
		const result = md.render(`
# Header 1
Text.
### Header 2
Lorem?
## Header 3
Ipsum.
# Last header
Markdown rules!
`);
		cleanCompare(result, expected);
	});

	it("should parse incorrect order of headers", () => {
		const expected = `
<section id="header-4" aria-labelledby="header-4-heading">
  <h4 id="header-4-heading">Header 4</h4>
  <p>Text.</p>
</section>
<section id="header-3" aria-labelledby="header-3-heading">
  <h3 id="header-3-heading">Header 3</h3>
  <p>Hello!</p>
</section>`;

		const result = md.render(`
#### Header 4
Text.
### Header 3
Hello!
`);
		cleanCompare(result, expected);
	});
	it("should handle sections in list", () => {
		const expected = `
<ul>
  <li>foo
    <section id="header-2" aria-labelledby="header-2-heading">
      <h3 id="header-2-heading">Header 2</h3>
      Lorem?
    </section>
  </li>
  <li>bar
    <section id="last-header" aria-labelledby="last-header-heading">
      <h2 id="last-header-heading">Last header</h2>
      Markdown rules!
    </section>
  </li>
</ul>`;
		const result = md.render(`
- foo
  ### Header 2
  Lorem?
- bar
  ## Last header
  Markdown rules!
`);

		cleanCompare(result, expected);
	});

	it("should close sections when a new header is of same level", () => {
		const expected = `
<section id="asdf" aria-labelledby="asdf-heading">
  <h3 id="asdf-heading">asdf</h3>
  <p>lorem</p>
</section>
<section id="fdsa" aria-labelledby="fdsa-heading">
  <h3 id="fdsa-heading">fdsa</h3>
  <p>ipsum</p>
</section>
`;
		const result = md.render(`
### asdf
lorem

### fdsa
ipsum
`);
		cleanCompare(result, expected);
	});

	it("should move, not copy, ID from header", () => {
		const expected = `
<section id="asdf" aria-labelledby="asdf-heading">
  <h1 id="asdf-heading">asdf</h1>
  <p>qwerty</p>
</section>
`;
		const result = md.render(`
# asdf {#asdf}
qwerty
`);

		cleanCompare(result, expected);
	});

	it("should join inline text & code spans with their spacing intact", () => {
		const result = md.render("## Hello *big* world\n\n## Using `foo()` here\n");
		assert.match(result, /<section id="hello-big-world"/);
		assert.ok(result.includes("<section id=\"using-foo()-here\""));
	});

	it("should suffix duplicate ids", () => {
		const result = md.render("## Setup\n\n## Setup\n\n## Setup\n");
		assert.deepEqual(
			[...result.matchAll(/<section id="([^"]*)"/g)].map((m) => m[1]),
			["setup", "setup-1", "setup-2"],
		);
	});

	it("should keep an explicit id & reserve it against generated ones", () => {
		const result = md.render("# One {#setup}\n\n# Setup\n");
		assert.deepEqual(
			[...result.matchAll(/<section id="([^"]*)"/g)].map((m) => m[1]),
			["setup", "setup-1"],
		);
	});

	it("should leave the id off a heading with no text", () => {
		assert.doesNotMatch(md.render("# \n\ntext\n"), /id=/);
	});

	it("should accept a custom slugify", () => {
		const custom = markdownIt().use(anchorSections, { slugify: (text) => `x-${slugify(text)}` });
		assert.match(custom.render("# Hi\n"), /<section id="x-hi"/);
	});

	it("should encode ids for use as URL fragments", () => {
		const headings = [
			"Hello *big* world",
			"Using `foo()` here",
			"See [the docs](http://x) now",
			"Café au lait",
			"日本語の見出し",
			"???",
			"2024 plans",
			"A.B (c)?",
			"Foo & Bar",
			"Hello   world",
			"Setup",
			"Setup",
		];
		const result = markdownIt().use(anchorSections).render(headings.map((h) => `## ${h}`).join("\n\n"));
		assert.deepEqual([...result.matchAll(/<section id="([^"]*)"/g)].map((m) => m[1]), [
			"hello-big-world",
			"using-foo()-here",
			"see-the-docs-now",
			"caf%C3%A9-au-lait",
			"%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E8%A6%8B%E5%87%BA%E3%81%97",
			"%3F%3F%3F",
			"2024-plans",
			"a.b-(c)%3F",
			"foo-%26-bar",
			"hello-world",
			"setup",
			"setup-1",
		]);
	});

	it("should label each section with its heading", () => {
		const expected = `
<section id="intro" aria-labelledby="intro-heading">
  <h1 id="intro-heading">Intro</h1>
  <section id="details" aria-labelledby="details-heading">
    <h2 id="details-heading">Details</h2>
  </section>
</section>`;
		cleanCompare(md.render("# Intro\n\n## Details\n"), expected);
	});

	it("should derive the heading id from an explicit id", () => {
		const expected = "<section id=\"intro\" aria-labelledby=\"intro-heading\"><h1 class=\"big\" id=\"intro-heading\">Welcome</h1></section>";
		cleanCompare(md.render("# Welcome {.big #intro}\n"), expected);
	});

	it("should keep heading ids unique", () => {
		const result = md.render("## Setup\n\n## Setup heading\n\n## Setup\n");
		const ids = [...result.matchAll(/ id="([^"]*)"/g)].map((m) => m[1]);
		assert.equal(new Set(ids).size, ids.length);
		assert.deepEqual(
			[...result.matchAll(/aria-labelledby="([^"]*)"/g)].map((m) => m[1]),
			[...result.matchAll(/<h2 id="([^"]*)"/g)].map((m) => m[1]),
		);
	});

	it("should not label a section without an id", () => {
		const result = md.render("# \n\ntext\n");
		assert.doesNotMatch(result, /aria-labelledby/);
	});
});
