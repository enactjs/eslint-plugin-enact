/**
 * Prevent missing name string property in an Enact kind component definition
 *
 * Based on the React display-name rule created by Yannick Croissant
 *     https://github.com/yannickcr/eslint-plugin-react
 * Enact-specific modifications by Jason Robitaille
 */

'use strict';

var Components = require('../util/Components');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Prevent missing name string in an Enact component definition',
      category: 'Best Practices',
      recommended: true
    },

    schema: [{
      type: 'object',
      properties: {
        ignoreTranspilerName: {
          type: 'boolean'
        }
      },
      additionalProperties: false
    }]
  },

  create: Components.detect(function(context, components, utils) {

    var sourceCode = context.getSourceCode();
    var config = context.options[0] || {};
    var ignoreTranspilerName = config.ignoreTranspilerName || true;

    var MISSING_MESSAGE = 'Component definition is missing a name property';

    /**
     * Checks if we are declaring a display name
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if we are declaring a display name, false if not.
     */
    function isNameDeclaration(node) {
      switch (node.type) {
        // Special case for class properties
        // (babel-eslint does not expose property name so we have to rely on tokens)
        case 'ClassProperty':
        case 'PropertyDefinition':
          var tokens = sourceCode.getFirstTokens(node, 2);
          if (
            tokens[0].value === 'name' ||
            (tokens[1] && tokens[1].value === 'name')
          ) {
            return true;
          }
          return false;
        case 'Identifier':
          return node.name === 'name';
        case 'Literal':
          return node.value === 'name';
        default:
          return false;
      }
    }

    /**
     * Mark a prop type as declared
     * @param {ASTNode} node The AST node being checked.
     */
    function markNameAsDeclared(node) {
      components.set(node, {
        hasName: true
      });
    }

    /**
     * Reports missing display name for a given component
     * @param {Object} component The component to process
     */
    function reportMissingName(component) {
      context.report({
        node: component.node,
        message: MISSING_MESSAGE,
        data: {
          component: component.name
        }
      });
    }

    /**
     * Checks if the component have a name set by the transpiler
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if component have a name, false if not.
     */
    function hasTranspilerName(node) {
      var namedObjectAssignment = (
        node.type === 'ObjectExpression' &&
        node.parent &&
        node.parent.parent &&
        node.parent.parent.type === 'AssignmentExpression' && (
          !node.parent.parent.left.object ||
          node.parent.parent.left.object.name !== 'module' ||
          node.parent.parent.left.property.name !== 'exports'
        )
      );
      var namedObjectDeclaration = (
          node.type === 'ObjectExpression' &&
          node.parent &&
          node.parent.parent &&
          node.parent.parent.type === 'VariableDeclarator'
      );
      var namedClass = (
        (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') &&
        node.id &&
        node.id.name
      );

      var namedFunctionDeclaration = (
        (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') &&
        node.id &&
        node.id.name
      );

      var namedFunctionExpression = (
        (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') &&
        node.parent &&
        (node.parent.type === 'VariableDeclarator' || node.parent.method === true)
      );

      if (
        namedObjectAssignment || namedObjectDeclaration ||
        namedClass ||
        namedFunctionDeclaration || namedFunctionExpression
      ) {
        return true;
      }
      return false;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {

      'ClassProperty, PropertyDefinition': function(node) {
        if (!isNameDeclaration(node)) {
          return;
        }
        markNameAsDeclared(node);
      },

      MemberExpression: function(node) {
        if (!isNameDeclaration(node.property)) {
          return;
        }
        var component = utils.getRelatedComponent(node);
        if (!component) {
          return;
        }
        markNameAsDeclared(component.node);
      },

      FunctionExpression: function(node) {
        if (ignoreTranspilerName || !hasTranspilerName(node)) {
          return;
        }
        markNameAsDeclared(node);
      },

      FunctionDeclaration: function(node) {
        if (ignoreTranspilerName || !hasTranspilerName(node)) {
          return;
        }
        markNameAsDeclared(node);
      },

      ArrowFunctionExpression: function(node) {
        if (ignoreTranspilerName || !hasTranspilerName(node)) {
          return;
        }
        markNameAsDeclared(node);
      },

      MethodDefinition: function(node) {
        if (!isNameDeclaration(node.key)) {
          return;
        }
        markNameAsDeclared(node);
      },

      ClassExpression: function(node) {
        if (ignoreTranspilerName || !hasTranspilerName(node)) {
          return;
        }
        markNameAsDeclared(node);
      },

      ClassDeclaration: function(node) {
        if (ignoreTranspilerName || !hasTranspilerName(node)) {
          return;
        }
        markNameAsDeclared(node);
      },

      ObjectExpression: function(node) {
        if (ignoreTranspilerName || !hasTranspilerName(node)) {
          // Search for the displayName declaration
          node.properties.forEach(function(property) {
            if (!property.key || !isNameDeclaration(property.key)) {
              return;
            }
            markNameAsDeclared(node);
          });
          return;
        }
        markNameAsDeclared(node);
      },

      'Program:exit': function() {
        var list = components.list();
        // Report missing display name for all components
        for (var component in list) {
          if (!list.hasOwnProperty(component) ||
              !utils.isKindComponent(list[component].node) ||
              list[component].hasName) {
            continue;
          }
          reportMissingName(list[component]);
        }
      }
    };
  })
};
