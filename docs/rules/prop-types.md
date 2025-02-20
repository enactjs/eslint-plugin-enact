# Prevent missing props validation in an Enact component definition (prop-types)

PropTypes improve the reusability of your component by validating the received data.

It can warn other developers if they make a mistake while reusing the component with improper data type.

This rule supersedes `react/prop-types`.  Be sure to disable `react/prop-types` in your config.

Props created using the `handlers` property are accessible to `computed` and `render`. Props created in `computed` are available in `render`.

## Rule Details

The following patterns are considered warnings:

```js
const Hello = kind({
  name: 'Example',
  render: function ({name}) {
    return <div>Hello {name}</div>;
  }
});

const Hello = kind({
  name: 'Example',
  propTypes: {
    firstname: React.PropTypes.string.isRequired
  },
  render: function ({firstname, lastname}) {
    return <div>Hello {firstname} {lastname}</div>; // lastname type is not defined in propTypes
  }
});

const Hello = kind({
  name: 'Example',
  propTypes: {
    firstname: React.PropTypes.string.isRequired
  },
  render: function ({firstname, ...rest}) {
    return <div>Hello {firstname} {rest.lastname}</div>; // lastname type is not defined in propTypes
  }
});
```

Examples of correct usage without warnings:

```js
const Hello = kind({
  name: 'Example',
  propTypes: {
    name: React.PropTypes.string.isRequired,
  },
  render: function ({name}) {
    return <div>Hello {name}</div>;
  },
});

// Or in when using spread operator within deconstructed render arguments:
const Hello = kind({
  name: 'Example',
  propTypes: {
    firstname: React.PropTypes.string.isRequired,
    middlename: React.PropTypes.string.isRequired,
    lastname: React.PropTypes.string.isRequired
  },
  render: function ({firstname, ...rest}) {
    return <div>Hello {firstname} {rest.middlename} {rest.lastname}</div>;
  },
});
```

The following patterns are not considered warnings:

```js
const Hello = kind({
  name: 'Example',
  render: function () {
    return <div>Hello World</div>;
  },
});

// Referencing an external object disables the rule for the component
const Hello = kind({
  name: 'Example',
  propTypes: myPropTypes,
  render: function ({name}) {
    return <div>Hello {name}</div>;
  },
});
```

## Rule Options

This rule can take one argument to ignore some specific props during validation.

```
...
"enact/prop-types": [<enabled>, { ignore: <ignore>, customValidators: <customValidator> }]
...
```

* `enabled`: for enabling the rule. 0=off, 1=warn, 2=error. Defaults to 0.
* `ignore`: optional array of props name to ignore during validation.
* `customValidators`: optional array of validators used for propTypes validation.

### As for "exceptions"

It would seem that some common properties such as `props.children` or `props.className`
(and alike) need to be treated as exceptions.

As it aptly noticed in
[#7](https://github.com/yannickcr/eslint-plugin-react/issues/7)

> Why should children be an exception?
> Most components don't need `this.props.children`, so that makes it extra important
to document `children` in the propTypes.

Generally, you should use `React.PropTypes.node` for `children`. It accepts
anything that can be rendered: numbers, strings, elements or an array containing
these types.

## About component detection

For this rule to work, it needs to detect valid applicable components. Specifically, this
rule targets stateless Enact components created via the `kind()` factory.

Higher-order components created via the Enact `hoc()` factory are currently not being processed,
though that may change in the future.

For React components (created via `React.creatClass()`, ES6 React classes, and stateless functional
components), please use the eslint-plugin-react's prop-types rule instead.
