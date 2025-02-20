# Prevent false react/display-name name warning in an Enact kind component definition (display-name)

When using `react/display-name` certain false warnings are given for Enact kinds. This rule replaces `react/display-name` for use with `kind()`.

This rule supersedes `react/display-name`.  Be sure to disable `react/display-name` in your config.

## Rule Details

The following patterns are considered warnings:

```js
const Hello = createReactClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});
```

The following patterns are not considered warnings:

```js
const Hello = kind({
  name: 'Example',
  render: function () {
    return <div>Hello World</div>;
  }
});
```

## Rule Options

```js
...
"enact/display-name": [<enabled>, { "ignoreTranspilerName": <boolean> }]
...
```

See [display-name at eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/display-name.md) for more information.

## About component detection

For this rule to work we need to detect React components, this could be very hard since components could be declared in a lot of ways.

For now, we should detect components created with:

* `createReactClass()`
* an ES6 class that inherit from `React.Component` or `Component`
* a stateless function that return JSX or the result of a `React.createElement` call.
