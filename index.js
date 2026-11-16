/**
 * Create anchor sections from markdown headers.
 *
 * This plugin wraps content in section tags start from a header until the next header of the same level occurs.
 * This facilitates intersection observers identifying when a section of content has left the viewport.
 *
 */

/**
 * Get the level of a heading.
 * @param {string} header
 * @returns {number}
 */
function headingLevel(header) {
	return Number.parseInt(String(header).charAt(1));
}

/**
 * Get the last element of an array.
 * @param {Array<T>} arr
 * @returns {T | undefined}
 */
function last(arr) {
	return arr.slice(-1)[0];
}

/**
 * Default slugifier: lowercases, joins words with dashes, & percent-encodes the rest so the id works as a URL fragment.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
	return encodeURIComponent(String(text).trim().toLowerCase().replace(/\s+/g, "-"));
}

/**
 * Get the plain text of an inline token, keeping code spans.
 * @param {import('markdown-it').Token | undefined} inline
 * @returns {string}
 */
function headingText(inline) {
	return (inline?.children ?? [])
		.filter((child) => child.type === "text" || child.type === "code_inline")
		.map((child) => child.content)
		.join("");
}

/**
 * Reserve an id, suffixing -1, -2, … on collision.
 * @param {string} id
 * @param {Set<string>} used
 * @returns {string}
 */
function uniqueId(id, used) {
	let unique = id;
	for (let n = 1; used.has(unique); n++) unique = `${id}-${n}`;
	used.add(unique);
	return unique;
}

/**
 * Add anchor sections to the markdown.
 * @param {import('markdown-it').MarkdownIt} md
 * @param {{ slugify?: (text: string) => string }} [options]
 * @returns {void}
 */
export default function(md, options = {}) {
	const slug = options.slugify ?? slugify;

	/**
   * Add sections to the markdown.
   * @param {import('markdown-it').StateCore} state
   * @returns {void}
   */
	function addSections(state) {
		const tokens = [];  // output
		const Token = state.Token;
		const sections = [];
		const usedIds = new Set();
		let nestedLevel = 0;  // level of nesting

		/**
     * Open a section.
     * @param {Object} section
     * @returns {import('markdown-it').Token}
     */
		function openSection(section) {
			const t = new Token("section_open", "section", 1);
			t.block = true;  // section is a block-level element
			t.attrs = section.id ? [["id", section.id], ["aria-labelledby", section.headingId]] : [];
			return t;
		}

		/**
     * Close a section.
     * @returns {import('markdown-it').Token}
     */
		function closeSection() {
			const t = new Token("section_close", "section", -1);
			t.block = true;
			return t;
		}

		/**
     * Close sections.
     * @param {Object} section
     * @returns {void}
     */
		function closeSections(section) {
			while (last(sections) && section.header <= last(sections).header) {
				sections.pop();
				tokens.push(closeSection());
			}
		}

		/**
     * Close sections to the current nesting level.
     * @param {number} nesting
     * @returns {void}
     */
		function closeSectionsToCurrentNesting(nesting) {
			while (last(sections) && nesting < last(sections).nesting) {
				sections.pop();
				tokens.push(closeSection());
			}
		}

		/**
     * Close all sections.
     * @returns {void}
     */
		function closeAllSections() {
			while (sections.pop()) {
				tokens.push(closeSection());
			}
		}

		for (let i = 0, l = state.tokens.length; i < l; i++) {
			const token = state.tokens[i];

			// record level of nesting
			if (token.type.search("heading") !== 0) {
				nestedLevel += token.nesting;
			}

			// close sections to the current nesting level
			if (last(sections) && nestedLevel < last(sections).nesting) {
				closeSectionsToCurrentNesting(nestedLevel);
			}

			// add sections before headers
			if (token.type == "heading_open") {
				const idx = token.attrIndex("id");
				let id;
				if (idx >= 0) {
					id = token.attrs[idx][1];
					// Remove the id attribute from the token
					token.attrs.splice(idx, 1);
				}
				if (id) {
					usedIds.add(id);
				} else {
					const text = slug(headingText(state.tokens[i + 1]));
					if (text) id = uniqueId(text, usedIds);
				}

				// the section takes the id, so the heading needs its own for aria-labelledby
				let headingId;
				if (id) {
					headingId = uniqueId(`${id}-heading`, usedIds);
					token.attrSet("id", headingId);
				}

				// create a section object
				const section = {
					id,
					headingId,
					header: headingLevel(token.tag),
					nesting: nestedLevel,
				};

				// close sections that are older than the current section
				if (last(sections) && section.header <= last(sections).header) {
					closeSections(section);
				}

				// add the section to the output; copy the id from the heading token
				tokens.push(openSection(section));

				// add the section to the list of sections
				sections.push(section);
			}

			tokens.push(token);
		}  // end for every token

		closeAllSections();

		state.tokens = tokens;
	}

	md.core.ruler.push("anchor_sections", addSections);

};
