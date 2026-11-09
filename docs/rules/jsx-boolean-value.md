# Enforce shorthand for `true` JSX attribute values (jsx-boolean-value)

Replacement for the `jsx-boolean-value` rule of [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react),
which does not support ESLint 10. Only the `never` mode is supported. This rule is fixable.

## Rule Details

The following patterns are considered warnings:

```js
<Button disabled={true} />
```

The following patterns are not considered warnings:

```js
<Button disabled />
<Button disabled={false} />
```
