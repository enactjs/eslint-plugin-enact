/**
 * @fileoverview Utility functions for React pragma configuration
 * @author Yannick Croissant
 * @modified-by Jason Robitaille for Enact usage
 */
'use strict';

var JSX_ANNOTATION_REGEX = /^\*\s*@jsx\s+([^\s]+)/;
// Does not check for reserved keywords or Unicode characters
var JS_IDENTIFIER_REGEX = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;


function getKindFromContext(context) {
  var pragma = 'kind';
  // .eslintrc shared settings (http://eslint.org/docs/user-guide/configuring#adding-shared-settings)
  if (context.settings.enact && context.settings.enact.kind) {
    pragma = context.settings.enact.kind;
  }
  if (!JS_IDENTIFIER_REGEX.test(pragma)) {
    throw new Error('kind pragma ' + pragma + 'is not a valid function name');
  }
  return pragma;
}

function getHocFromContext(context) {
  var pragma = 'hoc';
  // .eslintrc shared settings (http://eslint.org/docs/user-guide/configuring#adding-shared-settings)
  if (context.settings.enact && context.settings.enact.hoc) {
    pragma = context.settings.enact.hoc;
  }
  if (!JS_IDENTIFIER_REGEX.test(pragma)) {
    throw new Error('hoc pragma ' + pragma + 'is not a valid function name');
  }
  return pragma;
}

function getCreateClassFromContext(context) {
  var pragma = 'createClass';
  // .eslintrc shared settings (http://eslint.org/docs/user-guide/configuring#adding-shared-settings)
  if (context.settings.react && context.settings.react.createClass) {
    pragma = context.settings.react.createClass;
  }
  if (!JS_IDENTIFIER_REGEX.test(pragma)) {
    throw new Error('createClass pragma ' + pragma + 'is not a valid function name');
  }
  return pragma;
}

function getFromContext(context) {
  var pragma = 'React';
  // .eslintrc shared settings (http://eslint.org/docs/user-guide/configuring#adding-shared-settings)
  if (context.settings.react && context.settings.react.pragma) {
    pragma = context.settings.react.pragma;
  }
  if (!JS_IDENTIFIER_REGEX.test(pragma)) {
    throw new Error('React pragma ' + pragma + 'is not a valid identifier');
  }
  return pragma;
}

function getFromNode(node) {
  var matches = JSX_ANNOTATION_REGEX.exec(node.value);
  if (!matches) {
    return false;
  }
  return matches[1].split('.')[0];
}

module.exports = {
  getKindFromContext: getKindFromContext,
  getHocFromContext: getHocFromContext,
  getCreateClassFromContext: getCreateClassFromContext,
  getFromContext: getFromContext,
  getFromNode: getFromNode
};
