'use strict';

const rule = require('../../lib/rules/jsx-props-no-multi-spaces'),
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

ruleTester.run('jsx-props-no-multi-spaces', rule, {
	valid: [
		'<A a b={1} {...c} />',
		'<A.B a />',
		'<A\n\ta\n\tb\n/>'
	],
	invalid: [
		{code: '<A  a />', output: '<A a />', errors: [{messageId: 'onlyOneSpace'}]},
		{code: '<A a  {...c} />', output: '<A a {...c} />', errors: [{messageId: 'onlyOneSpace'}]},
		{code: '<A\n\ta\n\n\tb\n/>', errors: [{messageId: 'noLineGap'}]}
	]
});
