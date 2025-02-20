ESLint-plugin-Enact
===================

Enact specific linting rules for ESLint

# Installation

Install [ESLint](https://www.github.com/eslint/eslint) either locally or globally.

```sh
$ npm install eslint
```

If you installed `ESLint` globally, you have to install React plugin globally too. Otherwise, install it locally.

```sh
$ npm install eslint-plugin-enact
```

# Configuration

Add `plugins` section and specify ESLint-plugin-Enact as a plugin.

```json
{
  "plugins": [
    "enact"
  ]
}
```

You can also specify some settings that will be shared across all the plugin rules.

```js
{
  "settings": {
    "enact": {
      "kind": "kind", // Regex for Component Factory to use, default to "kind"
      "hoc": "hoc"    // Regex for HoC Factory to use, default to "hoc"
    }
  }
}
```

If it is not already the case you must also configure `ESLint` to support JSX.

With ESLint 1.x.x:

```json
{
  "ecmaFeatures": {
    "jsx": true
  }
}
```

With ESLint 2.x.x+:

```json
{
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
```

Finally, enable all the rules that you would like to use:

```json
  "rules": {
    "enact/kind-name": 1,
    "enact/display-name": 1,
    "enact/prop-types": 1,
    "enact/no-module-exports-import": 2
  }
```

# List of supported rules

* [enact/kind-name](docs/rules/kind-name.md): Prevent missing `name` in an Enact component definition
* [enact/display-name](docs/rules/display-name.md): Prevent missing `displayName` in a React component definitions without false-flagging Enact kinds
* [enact/prop-types](docs/rules/prop-types.md): Prevent missing props validation in a React component definition
* [enact/no-module-exports-import](docs/rules/no-module-exports-import.md): Disallow module.exports with import statements (see [webpack issue #4039](https://github.com/webpack/webpack/issues/4039))

> Note: `enact/display-name` and `enact/prop-types` supersede `react/display-name` and `react/prop-types`, respectively. The latter two should be disabled when used with Enact.

## Other useful plugins

- React: [eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react)

# License

ESLint-plugin-Enact is based on work from ESLint-plugin-React and is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

## Copyright and License Information

Unless otherwise specified, all content, including all source code files and
documentation files in this repository are:

Copyright (c) 2016-2024 LG Electronics

Unless otherwise specified or set forth in the NOTICE file, all content,
including all source code files and documentation files in this repository are:
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this content except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
