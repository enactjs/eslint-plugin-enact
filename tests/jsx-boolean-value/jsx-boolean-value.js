'use strict';

const rule = require('../../lib/rules/jsx-boolean-value'),
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

ruleTester.run('jsx-boolean-value', rule, {
	valid: [
		{code: '<A b />', options: ['never']},
		{code: '<A b={false} />', options: ['never']},
		{code: '<A b="true" />', options: ['never']},
		{code: '<A b={!0} />', options: ['never']}
	],
	invalid: [
		{
			code: '<A b={true} />',
			options: ['never'],
			output: '<A b />',
			errors: [{messageId: 'omitValue', data: {name: 'b'}}]
		},
		{
			code: '<A {...p} b={true} c={true} />',
			options: ['never'],
			output: '<A {...p} b c />',
			errors: [{messageId: 'omitValue'}, {messageId: 'omitValue'}]
		}
	]
});
