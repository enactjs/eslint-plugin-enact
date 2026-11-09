'use strict';

const rule = require('../../lib/rules/jsx-no-bind'),
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

ruleTester.run('jsx-no-bind', rule, {
	valid: [
		'<A onClick={handler} />',
		'<A onClick={this.handler} />',
		'<A onClick={this.handler.call(this)} />',
		// Functions declared at module level are not tracked
		'const handler = () => {}; const C = () => <A onClick={handler} />;',
		// Only `const` declarations are tracked
		'function C () { let handler = () => {}; return <A onClick={handler} />; }',
		{code: '<A ref={(node) => { this.node = node; }} />', options: [{ignoreRefs: true}]}
	],
	invalid: [
		{code: '<A onClick={() => {}} />', errors: [{messageId: 'arrowFunc'}]},
		{code: '<A onClick={function () {}} />', errors: [{messageId: 'func'}]},
		{code: '<A onClick={this.handler.bind(this)} />', errors: [{messageId: 'bindCall'}]},
		{code: '<A onClick={cond ? () => {} : handler} />', errors: [{messageId: 'arrowFunc'}]},
		{code: '<A ref={(node) => node} />', errors: [{messageId: 'arrowFunc'}]},
		{
			code: 'function C () { const handler = () => {}; return <A onClick={handler} />; }',
			errors: [{messageId: 'arrowFunc'}]
		},
		{
			code: 'function C () { function handler () {} return <A onClick={handler} />; }',
			errors: [{messageId: 'func'}]
		},
		{
			code: 'function C () { const handler = this.handler.bind(this); if (x) { return <A onClick={handler} />; } }',
			errors: [{messageId: 'bindCall'}]
		}
	]
});
