'use strict';

const rule = require('../../lib/rules/prop-types'),
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

ruleTester.run('prop-types', rule, {

	valid: [
		"kind({propTypes: {one: PropTypes.string}, render: ({one}) => (<div>{one}</div>)});",
		"kind({propTypes: {one: PropTypes.string}, computed: {fred: ({one}) => 1}});",
		"kind({computed: {fred: ({styler}) => 1}});",
		"kind({propTypes: {one: PropTypes.string}, handlers: {fred: (ev, {one}) => 1}});",
		"kind({propTypes: {one: PropTypes.string}, handlers: {fred: (ev, {one}) => ev.target}});",
		"kind({propTypes: {one: PropTypes.string}, computed: {fred: ({one}) => 1}, render: ({one, fred}) => (<div>{one}</div>)});",
		"kind({propTypes: {one: PropTypes.string}, handlers: {fred: (ev, {one}) => 1}, render: ({one, fred}) => (<div>{one}</div>)});",
		"kind({propTypes: {one: PropTypes.string}, computed: {one: ({one}) => 1}, render: ({one}) => (<div>{one}</div>)});",
		"kind({propTypes: {one: PropTypes.string}, handlers: {one: (ev, {one}) => 1}, render: ({one}) => (<div>{one}</div>)});",
		"kind({handlers: {fred: (ev, props) => 1}, computed: {bilbo: ({fred}) => 2}});",
	],
	invalid: [
		{
			code: "kind({render: ({one}) => <div>{one}</div>});",
			errors: [{
				message: '\'one\' is missing in props validation',
				type: 'Property'
			}]
		},
		{
			code: "kind({render: (props) => <div>{props.one}</div>});",
			errors: [{
				message: '\'one\' is missing in props validation',
				type: 'Identifier'
			}]
		},
		{
			code: "kind({computed: {fred: ({one}) => 1}});",
			errors: [{
				message: '\'one\' is missing in props validation',
				type: 'Property'
			}]
		},
		{
			code: "kind({computed: {fred: (props) => (props.one)}});",
			errors: [{
				message: '\'one\' is missing in props validation',
				type: 'Identifier'
			}]
		},
		{
			code: "kind({handlers: {fred: (ev, {one}) => 1}});",
			errors: [{
				message: '\'one\' is missing in props validation',
				type: 'Property'
			}]
		},
		{
			code: "kind({handlers: {fred: (ev, props) => (props.one)}});",
			errors: [{
				message: '\'one\' is missing in props validation',
				type: 'Identifier'
			}]
		},
		{
			code: "kind({handlers: {fred: (ev, {bilbo}) => 1}, computed: {bilbo: (props) => 2}});",
			errors: [{
				message: '\'bilbo\' is missing in props validation',
				type: 'Property'
			}]
		},
		{
			code: "kind({computed: {bilbo: (props) => 2, baggins: ({bilbo}) => 3}});",
			errors: [{
				message: '\'bilbo\' is missing in props validation',
				type: 'Property'
			}]
		},
		{
			code: "kind({handlers: {fred: (ev, props) => 1, wilma: (ev, {fred}) => 2}});",
			errors: [{
				message: '\'fred\' is missing in props validation',
				type: 'Property'
			}]
		},
	]
});
