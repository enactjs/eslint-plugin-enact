# Disallow multiple spaces between inline JSX props (jsx-props-no-multi-spaces)

Migration of the `jsx-props-no-multi-spaces` rule of [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react),
which does not support ESLint 10. The copy in `@stylistic/eslint-plugin` is deprecated and logs a warning on every run.
This rule is fixable.

## Rule Details

The following patterns are considered warnings:

```js
<Button  size="small" />
<Button size="small"  disabled />

<Button
	size="small"

	disabled
/>
```

The following patterns are not considered warnings:

```js
<Button size="small" disabled />

<Button
	size="small"
	disabled
/>
```
