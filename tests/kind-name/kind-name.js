'use strict';

const rule = require('../../lib/rules/kind-name'),
	RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
	languageOptions: {
		ecmaVersion: 6,
		sourceType: "module",
		parserOptions: {
			ecmaFeatures: {
				jsx: true
			}
		}
	}
});

const ruleTester = new RuleTester();

ruleTester.run('kind-name', rule, {

	valid: [
		"const t = kind({name: 'hello'});",
	],

	invalid: [
		{
			code: "const t = kind({render: (props) => (<div {...props}>Hello</div>)});",
			errors: [{
				message: 'Component definition is missing a name property',
				type: 'ObjectExpression'
			}]
		}
	]
});
