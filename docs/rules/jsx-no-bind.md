# Disallow `.bind()`, arrow functions and functions in JSX props (jsx-no-bind)

A function created in a JSX prop is a new function on every render, which causes unnecessary re-renders of
components that compare their props.

Migration of the `jsx-no-bind` rule of [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react), which does
not support ESLint 10. Like the original, it also reports `const` variables and function declarations that hold such a
function, are declared in a block (e.g. a component body) and are passed to a JSX prop.

## Options

#### `ignoreRefs`
 - When `true`, the `ref` prop is not checked. Default: `false`.

```json
"enact/jsx-no-bind": ["warn", {"ignoreRefs": true}]
```

## Rule Details

The following patterns are considered warnings:

```js
<Button onClick={() => this.handleClick()} />
<Button onClick={this.handleClick.bind(this)} />
<Button onClick={function () {}} />

const Component = () => {
	const handleClick = () => {};
	return <Button onClick={handleClick} />;
};
```

The following patterns are not considered warnings:

```js
<Button onClick={this.handleClick} />

const handleClick = () => {};
const Component = () => <Button onClick={handleClick} />;
```
