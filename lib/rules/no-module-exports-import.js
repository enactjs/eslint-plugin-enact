/**
 * Disallow mixing of CommonJS and ES6 import/export styles in modules.
 *
 * Based on the no-import-module-exports rule created by Thomas Marek
 *     https://github.com/benmosher/eslint-plugin-import/pull/804
 * Modifications to inversely report the module.exports/exports and 
 * remove entrypoint detection by Jason Robitaille
 */

var {minimatch} = require('minimatch');

module.exports = {
	meta: {
		docs: {
			description: 'Disallow module.exports with import statements',
			category: 'Best Practices',
			recommended: true
		},
		fixable: 'code',
		schema: [{
			'type': 'object',
			'properties': {
				'exceptions': { 'type': 'array' }
			},
			'additionalProperties': false
		}]
	},
	create: function create(context) {
		var usesES6Imports = false;
		var options = context.options[0] || {};

		return {
			ImportDeclaration: function ImportDeclaration() {
				usesES6Imports = true;
			},
			MemberExpression: function MemberExpression(node) {
				var isIdentifier = node.object.type === 'Identifier';
				var hasKeywords = node.object.name ==='module' && node.property.name === 'exports';
				var isException = options.exceptions && options.exceptions.some(function (glob) {
					return minimatch(fileName, glob);
				});

				if (isIdentifier && hasKeywords && usesES6Imports && !isException) {
					context.report({
						node: node,
						message: 'No CommonJS exports when using ES6 import statements'
					});
				}
			}
		};
	}
};
