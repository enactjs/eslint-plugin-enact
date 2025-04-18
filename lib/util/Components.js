/**
 * @fileoverview Utility class and functions for React components detection
 * @author Yannick Croissant
 * @modified-by Jason Robitaille for Enact usage
 */
'use strict';

var doctrine = require('doctrine');
var variableUtil = require('./variable');
var pragmaUtil = require('./pragma');

/**
 * Components
 * @class
 */
function Components() {
  this._list = {};
  this._getId = function(node) {
    return node && node.range.join(':');
  };
}

/**
 * Add a node to the components list, or update it if it's already in the list
 *
 * @param {ASTNode} node The AST node being added.
 * @param {Number} confidence Confidence in the component detection (0=banned, 1=maybe, 2=yes)
 * @returns {Object} Added component object
 */
Components.prototype.add = function(node, confidence) {
  var id = this._getId(node);
  if (this._list[id]) {
    if (confidence === 0 || this._list[id].confidence === 0) {
      this._list[id].confidence = 0;
    } else {
      this._list[id].confidence = Math.max(this._list[id].confidence, confidence);
    }
    return this._list[id];
  }
  this._list[id] = {
    node: node,
    confidence: confidence
  };
  return this._list[id];
};

/**
 * Find a component in the list using its node
 *
 * @param {ASTNode} node The AST node being searched.
 * @returns {Object} Component object, undefined if the component is not found
 */
Components.prototype.get = function(node) {
  var id = this._getId(node);
  return this._list[id];
};

/**
 * Update a component in the list
 *
 * @param {ASTNode} node The AST node being updated.
 * @param {Object} props Additional properties to add to the component.
 */
Components.prototype.set = function(node, props) {
  while (node && !this._list[this._getId(node)]) {
    node = node.parent;
  }
  if (!node) {
    return;
  }
  var id = this._getId(node);
  this._list[id] = Object.assign(this._list[id], props);
};

/**
 * Return the components list
 * Components for which we are not confident are not returned
 *
 * @returns {Object} Components list
 */
Components.prototype.list = function() {
  var list = {};
  var usedPropTypes = {};
  // Find props used in components for which we are not confident
  for (var i in this._list) {
    if (!this._list.hasOwnProperty(i) || this._list[i].confidence >= 2) {
      continue;
    }
    var component = null;
    var node = null;
    node = this._list[i].node;
    while (!component && node.parent) {
      node = node.parent;
      // Stop moving up if we reach a decorator
      if (node.type === 'Decorator') {
        break;
      }
      component = this.get(node);
    }
    if (component) {
      usedPropTypes[this._getId(component.node)] = (this._list[i].usedPropTypes || []).filter(function(propType) {
        return !propType.node || propType.node.kind !== 'init';
      });
    }
  }
  // Assign used props in not confident components to the parent component
  for (var j in this._list) {
    if (!this._list.hasOwnProperty(j) || this._list[j].confidence < 2) {
      continue;
    }
    var id = this._getId(this._list[j].node);
    list[j] = this._list[j];
    if (usedPropTypes[id]) {
      list[j].usedPropTypes = (list[j].usedPropTypes || []).concat(usedPropTypes[id]);
    }
  }
  return list;
};

/**
 * Return the length of the components list
 * Components for which we are not confident are not counted
 *
 * @returns {Number} Components list length
 */
Components.prototype.length = function() {
  var length = 0;
  for (var i in this._list) {
    if (!this._list.hasOwnProperty(i) || this._list[i].confidence < 2) {
      continue;
    }
    length++;
  }
  return length;
};

function componentRule(rule, context) {
  var kind = pragmaUtil.getKindFromContext(context);
  var hoc = pragmaUtil.getHocFromContext(context);
  var createClass = pragmaUtil.getCreateClassFromContext(context);
  var pragma = pragmaUtil.getFromContext(context);
  const sourceCode = context.sourceCode || context.getSourceCode();
  var components = new Components();

  // Utilities for component detection
  var utils = {
    /**
     * Check if the node is an Enact Stateless Component
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if the node is an Enact component created via kind(), false if not
     */
    isKindComponent: function(node) {
      if (!node.parent) {
        return false;
      }
      return new RegExp('^' + kind + '$').test(sourceCode.getText(node.parent.callee));
    },

    /**
     * Check if the node is an Enact Higher Order Component
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if the node is an Enact component created via hoc(), false if not
     */
    isHocComponent: function(node) {
      if (!node.parent) {
        return false;
      }
      return new RegExp('^' + hoc + '$').test(sourceCode.getText(node.parent.callee));
    },

    /**
     * Check if the node is a React ES5 component
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if the node is a React ES5 component, false if not
     */
    isES5Component: function(node) {
      if (!node.parent) {
        return false;
      }
      return new RegExp('^(' + pragma + '\\.)?' + createClass + '$').test(sourceCode.getText(node.parent.callee));
    },

    /**
     * Check if the node is a React ES6 component
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if the node is a React ES6 component, false if not
     */
    isES6Component: function(node) {
      if (utils.isExplicitComponent(node)) {
        return true;
      }

      if (!node.superClass) {
        return false;
      }
      return new RegExp('^(' + pragma + '\\.)?(Pure)?Component$').test(sourceCode.getText(node.superClass));
    },

    /**
     * Check if the node is explicitly declared as a descendant of a React Component
     *
     * @param {ASTNode} node The AST node being checked (can be a ReturnStatement or an ArrowFunctionExpression).
     * @returns {Boolean} True if the node is explicitly declared as a descendant of a React Component, false if not
     */
    isExplicitComponent: function(node) {
      var comment = sourceCode.getJSDocComment(node);

      if (comment === null) {
        return false;
      }

      var commentAst = doctrine.parse(comment.value, {
        unwrap: true,
        tags: ['extends', 'augments']
      });

      var relevantTags = commentAst.tags.filter(function(tag) {
        return tag.name === 'React.Component' || tag.name === 'React.PureComponent';
      });

      return relevantTags.length > 0;
    },

    /**
     * Checks to see if our component extends React.PureComponent
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if node extends React.PureComponent, false if not
     */
    isPureComponent: function (node) {
      if (node.superClass) {
        return new RegExp('^(' + pragma + '\\.)?PureComponent$').test(sourceCode.getText(node.superClass));
      }
      return false;
    },

    isComputedKindProp: function(node) {
      return node.parent
          && node.parent.parent
          && node.parent.parent.parent
          && node.parent.parent.parent.key
          && node.parent.parent.parent.key.name==='computed'
          && node.parent.parent.parent.parent
          && utils.isKindComponent(node.parent.parent.parent.parent);
    },

    isHandlersKindProp: function(node) {
      return node.parent
          && node.parent.parent
          && node.parent.parent.parent
          && node.parent.parent.parent.key
          && node.parent.parent.parent.key.name==='handlers'
          && node.parent.parent.parent.parent
          && utils.isKindComponent(node.parent.parent.parent.parent);
    },

    /**
     * Check if the node is returning JSX
     *
     * @param {ASTNode} ASTNode The AST node being checked
     * @param {Boolean} [strict] If true, in a ternary condition the node must return JSX in both cases
     * @returns {Boolean} True if the node is returning JSX, false if not
     */
    isReturningJSX: function(ASTNode, strict) {
      var property;
      var node = ASTNode;
      switch (node.type) {
        case 'ReturnStatement':
          property = 'argument';
          break;
        case 'ArrowFunctionExpression':
          property = 'body';
          break;
        default:
          node = utils.findReturnStatement(node);
          if (!node) {
            return false;
          }
          property = 'argument';
      }

      var returnsConditionalJSXConsequent =
        node[property] &&
        node[property].type === 'ConditionalExpression' &&
        node[property].consequent.type === 'JSXElement'
      ;
      var returnsConditionalJSXAlternate =
        node[property] &&
        node[property].type === 'ConditionalExpression' &&
        node[property].alternate.type === 'JSXElement'
      ;
      var returnsConditionalJSX =
        strict ? (returnsConditionalJSXConsequent && returnsConditionalJSXAlternate) :
        (returnsConditionalJSXConsequent || returnsConditionalJSXAlternate);

      var returnsJSX =
        node[property] &&
        node[property].type === 'JSXElement'
      ;
      var returnsReactCreateElement =
        node[property] &&
        node[property].callee &&
        node[property].callee.property &&
        node[property].callee.property.name === 'createElement'
      ;

      return Boolean(
        returnsConditionalJSX ||
        returnsJSX ||
        returnsReactCreateElement
      );
    },

    /**
     * Find a return statement in the current node
     *
     * @param {ASTNode} node The AST node being checked
     * @returns {ASTNode|Boolean} The return statement node if found, otherwise false
     */
    findReturnStatement: function(node) {
      if (!node.value || !node.value.body || !node.value.body.body) {
        return false;
      }
      var i = node.value.body.body.length - 1;
      for (; i >= 0; i--) {
        if (node.value.body.body[i].type === 'ReturnStatement') {
          return node.value.body.body[i];
        }
      }
      return false;
    },

    /**
     * Get the parent component node from the current scope
     *
     * @returns {ASTNode} component node, null if we are not in a component
     */
    getParentComponent: function(node) {
      return (
        utils.getParentES6Component(node) ||
        utils.getParentES5Component(node) ||
        utils.getParentStatelessComponent(node)
      );
    },

    /**
     * Get the parent ES5 component or Enact kind component node from the current scope
     *
     * @returns {ASTNode|Null} component node, null if we are not in a component
     */
    getParentES5Component: function(node) {
      let scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();
      while (scope) {
        var parentNode = scope.block && scope.block.parent && scope.block.parent.parent;
        if (parentNode && (utils.isES5Component(parentNode) || utils.isKindComponent(parentNode))) {
          return parentNode;
        }
        scope = scope.upper;
      }
      return null;
    },

    /**
     * Get the parent ES6 component node from the current scope
     *
     * @returns {ASTNode|Null} component node, null if we are not in a component
     */
    getParentES6Component: function(node) {
      let scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();
      while (scope && scope.type !== 'class') {
        scope = scope.upper;
      }
      let parentNode = scope && scope.block;
      if (!parentNode || !utils.isES6Component(parentNode)) {
        return null;
      }
      return parentNode;
    },

    /**
     * Get the parent stateless component node from the current scope
     *
     * @returns {ASTNode|Null} component node, null if we are not in a component
     */
    getParentStatelessComponent: function(node) {
      let scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();
      while (scope) {
        var parentNode = scope.block;
        var isClass = parentNode.type === 'ClassExpression';
        var isFunction = /Function/.test(parentNode.type); // Functions
        var isMethod = parentNode.parent && parentNode.parent.type === 'MethodDefinition'; // Classes methods
        var isArgument = parentNode.parent && parentNode.parent.type === 'CallExpression'; // Arguments (callback, etc.)
        // Stop moving up if we reach a class or an argument (like a callback)
        if (isClass || isArgument) {
          return null;
        }
        // Return the node if it is a function that is not a class method
        if (isFunction && !isMethod) {
          // if stateless function is an Enact kind computed property, return the kind
          if(utils.isComputedKindProp(parentNode) || utils.isHandlersKindProp(parentNode)) {
            return(parentNode.parent.parent.parent.parent);
          } else {
            return parentNode;
          }
        }
        scope = scope.upper;
      }
      return null;
    },

    /**
     * Get the related component from a node
     *
     * @param {ASTNode} node The AST node being checked (must be a MemberExpression).
     * @returns {ASTNode|Null} component node, null if we cannot find the component
     */
    getRelatedComponent: function(node) {
      var i;
      var j;
      var k;
      var l;
      var componentName;
      var componentNode;
      let nodeParam = node;
      // Get the component path
      var componentPath = [];
      while (node) {
        if (node.property && node.property.type === 'Identifier') {
          componentPath.push(node.property.name);
        }
        if (node.object && node.object.type === 'Identifier') {
          componentPath.push(node.object.name);
        }
        node = node.object;
      }
      componentPath.reverse();
      componentName = componentPath.slice(0, componentPath.length - 1).join('.');

      // Find the variable in the current scope
      var variableName = componentPath.shift();
      if (!variableName) {
        return null;
      }
      var variableInScope;
      var variables = variableUtil.variablesInScope(sourceCode, context, nodeParam);
      for (i = 0, j = variables.length; i < j; i++) {
        if (variables[i].name === variableName) {
          variableInScope = variables[i];
          break;
        }
      }
      if (!variableInScope) {
        return null;
      }

      // Try to find the component using variable references
      var refs = variableInScope.references;
      var refId;
      for (i = 0, j = refs.length; i < j; i++) {
        refId = refs[i].identifier;
        if (refId.parent && refId.parent.type === 'MemberExpression') {
          refId = refId.parent;
        }
        if (sourceCode.getText(refId) !== componentName) {
          continue;
        }
        if (refId.type === 'MemberExpression') {
          componentNode = refId.parent.right;
        } else if (refId.parent && refId.parent.type === 'VariableDeclarator') {
          componentNode = refId.parent.init;
        }
        break;
      }

      if (componentNode) {
        // Return the component
        return components.add(componentNode, 1);
      }

      // Try to find the component using variable declarations
      var defInScope;
      var defs = variableInScope.defs;
      for (i = 0, j = defs.length; i < j; i++) {
        if (defs[i].type === 'ClassName' || defs[i].type === 'FunctionName' || defs[i].type === 'Variable') {
          defInScope = defs[i];
          break;
        }
      }
      if (!defInScope || !defInScope.node) {
        return null;
      }
      componentNode = defInScope.node.init || defInScope.node;

      // Traverse the node properties to the component declaration
      for (i = 0, j = componentPath.length; i < j; i++) {
        if (!componentNode.properties) {
          continue;
        }
        for (k = 0, l = componentNode.properties.length; k < l; k++) {
          if (componentNode.properties[k].key.name === componentPath[i]) {
            componentNode = componentNode.properties[k];
            break;
          }
        }
        if (!componentNode || !componentNode.value) {
          return null;
        }
        componentNode = componentNode.value;
      }

      // Return the component
      return components.add(componentNode, 1);
    }
  };

  // Component detection instructions
  var detectionInstructions = {
    ClassExpression: function(node) {
      if (!utils.isES6Component(node)) {
        return;
      }
      components.add(node, 2);
    },

    ClassDeclaration: function(node) {
      if (!utils.isES6Component(node)) {
        return;
      }
      components.add(node, 2);
    },

    'ClassProperty, PropertyDefinition': function(node) {
      node = utils.getParentComponent(node);
      if (!node) {
        return;
      }
      components.add(node, 2);
    },

    ObjectExpression: function(node) {
      if (!utils.isES5Component(node) && !utils.isKindComponent(node)) {
        return;
      }
      components.add(node, 2);
    },

    FunctionExpression: function(node) {
      var component = utils.getParentComponent(node);
      if (
        !component ||
        (component.parent && component.parent.type === 'JSXExpressionContainer')
      ) {
        // Ban the node if we cannot find a parent component
        components.add(node, 0);
        return;
      }
      components.add(component, 1);
    },

    FunctionDeclaration: function(node) {
      node = utils.getParentComponent(node);
      if (!node) {
        return;
      }
      components.add(node, 1);
    },

    ArrowFunctionExpression: function(node) {
      var component = utils.getParentComponent(node);
      if (
        !component ||
        (component.parent && component.parent.type === 'JSXExpressionContainer')
      ) {
        // Ban the node if we cannot find a parent component
        components.add(node, 0);
        return;
      }
      if (component.expression && utils.isReturningJSX(component)) {
        components.add(component, 2);
      } else {
        components.add(component, 1);
      }
    },

    ThisExpression: function(node) {
      var component = utils.getParentComponent(node);
      if (!component || !/Function/.test(component.type) || !node.parent.property) {
        return;
      }
      // Ban functions accessing a property on a ThisExpression
      components.add(node, 0);
    },

    BlockComment: function(node) {
      pragma = pragmaUtil.getFromNode(node) || pragma;
    },

    ReturnStatement: function(node) {
      if (!utils.isReturningJSX(node)) {
        return;
      }
      let scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();

      node = utils.getParentComponent(node);

      if (!node) {
        components.add(scope.block, 1);
        return;
      }
      components.add(node, 2);
    }
  };

  // Update the provided rule instructions to add the component detection
  var ruleInstructions = rule(context, components, utils);
  var updatedRuleInstructions = Object.assign({}, ruleInstructions);
  Object.keys(detectionInstructions).forEach(function(instruction) {
    updatedRuleInstructions[instruction] = function(node) {
      detectionInstructions[instruction](node);
      return ruleInstructions[instruction] ? ruleInstructions[instruction](node) : void 0;
    };
  });
  // Return the updated rule instructions
  return updatedRuleInstructions;
}

Components.detect = function(rule) {
  return componentRule.bind(this, rule);
};

module.exports = Components;
