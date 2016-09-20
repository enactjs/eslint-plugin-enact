'use strict';

var rules = {
  'prop-types': require('./lib/rules/prop-types'),
  'kind-name': require('./lib/rules/kind-name')
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
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        'enact/prop-types': 2,
        'enact/kind-name': 2
      },
    },
    all: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: allRules
    }
  }
};