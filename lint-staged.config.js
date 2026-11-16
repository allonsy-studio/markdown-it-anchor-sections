export default {
	"*.{js,json}": ["opx lint --fix"],
	"*.{md,mdx}": ["opx lint --fix"],
	"package.json": ["prettier-package-json --write"],
};
