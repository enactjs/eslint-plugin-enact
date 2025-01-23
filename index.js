'use strict';

var rules = {
	'prop-types': require('./lib/rules/prop-types'),
	'kind-name': require('./lib/rules/kind-name'),
	'display-name': require('./lib/rules/display-name'),
	'no-module-exports-import': require('./lib/rules/no-module-exports-import')
};

var ruleNames = Object.keys(rules);
var allRules = {};
for (var i = 0; i < ruleNames.length; i++) {
	allRules['enact/' + ruleNames[i]] = 2;
}

var exportedRules = {};
for (var key in rules) {
	if (!rules.hasOwnProperty(key)) {
		continue;
	}
	exportedRules[key] = rules[key];
}

const eslintPluginEnact = {
	meta: {
		name: "eslint-plugin-enact",
		version: "1.0.7"
	},
	configs: {},
	rules: exportedRules
}

// assign configs here so we can reference `plugin`
Object.assign(eslintPluginEnact.configs, {
	recommended: {
		languageOptions: {
			ecmaFeatures: {
				jsx: true
			}
		},
		rules: {
			'enact/prop-types': 2,
			'enact/kind-name': 2,
			'enact/display-name': 2,
			'enact/no-module-exports-import': 1
		}
	},
	all: {
		languageOptions: {
			ecmaFeatures: {
				jsx: true
			}
		},
		rules: allRules
	}
})

module.exports = eslintPluginEnact;
