'use strict';

const rule = require('../../lib/rules/jsx-no-duplicate-props'),
	RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		parserOptions: {
			ecmaFeatures: {
				jsx: true
			}
		}
	}
});

ruleTester.run('jsx-no-duplicate-props', rule, {
	valid: [
		'<A a b {...c} />',
		'<A a A />',
		// Namespaced names are ignored
		'<A x:y x:y />'
	],
	invalid: [
		{code: '<A a={1} a={2} />', errors: [{messageId: 'noDuplicateProps'}]},
		{code: '<A {...p} a {...q} a />', errors: [{messageId: 'noDuplicateProps'}]},
		{code: '<A a A />', options: [{ignoreCase: true}], errors: [{messageId: 'noDuplicateProps'}]}
	]
});
