'use strict';

const rule = require('../../lib/rules/display-name'),
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

ruleTester.run('display-name', rule, {

	valid: [{
		code: "const t = kind({render: (props) => (<div {...props}>Hello</div>)});",
		options: [{
			ignoreTranspilerName: true
		}]
	},
	{
		code: "const t = kind({computed: { myProp: (props) => (<div {...props}>Hello</div>)}});",
		options: [{
			ignoreTranspilerName: true
		}]
	},{
		code: "const t = kind({handlers: { myProp: (props) => (<div {...props}>Hello</div>)}});",
		options: [{
			ignoreTranspilerName: true
		}]
/*	},{  Disabling this one as this triggers errors upstream, too.
		code: "const t = kind({handlers: { myProp: (props) => ({another}) => (<div {...props}>Hello</div>)}});",
		options: [{
			ignoreTranspilerName: true
		}]
*/
	}],

	invalid: [
		{
			code: `
			class Hello extends React.Component {
			  render() {
				return <div>Hello {this.props.name}</div>;
			  }
			}
		  `,
		  options: [{
			ignoreTranspilerName: true
		  }],
			errors: [{
				message: 'Component definition is missing display name',
				type: 'ClassDeclaration'
			}]
		}
	]
});
