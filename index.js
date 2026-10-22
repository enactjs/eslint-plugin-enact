'use strict';

var rules = {
  'kind-name': require('./lib/rules/kind-name'),
  'display-name': require('./lib/rules/display-name'),
  'no-module-exports-import': require('./lib/rules/no-module-exports-import'),
  // TODO: remove these migrations of eslint-plugin-react rules (and their docs and tests) once eslint-plugin-react
  // supports ESLint 10 (https://github.com/jsx-eslint/eslint-plugin-react/pull/4022) and eslint-config-enact
  // switches back to it.
  'jsx-boolean-value': require('./lib/rules/jsx-boolean-value'),
  'jsx-no-bind': require('./lib/rules/jsx-no-bind'),
  'jsx-no-duplicate-props': require('./lib/rules/jsx-no-duplicate-props'),
  'jsx-props-no-multi-spaces': require('./lib/rules/jsx-props-no-multi-spaces')
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

module.exports = {
  rules: exportedRules,
  configs: {
    recommended: {
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          }
        }
      },
      rules: {
        'enact/kind-name': 2,
        'enact/display-name': 2,
        'enact/no-module-exports-import': 1
      }
    },
    all: {
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          }
        }
      },
      rules: allRules
    }
  }
};
