# Disallow duplicate properties in JSX elements (jsx-no-duplicate-props)

Migration of the `jsx-no-duplicate-props` rule of [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react),
which does not support ESLint 10.

## Options

#### `ignoreCase`
 - When `true`, props that differ only in case are considered duplicates. Default: `false`.

```json
"enact/jsx-no-duplicate-props": ["warn", {"ignoreCase": true}]
```

## Rule Details

The following patterns are considered warnings:

```js
<Button size="small" size="large" />
```

The following patterns are not considered warnings:

```js
<Button size="small" />
```
