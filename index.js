'use strict';
var path = require('path');
var dirname = path.dirname;
var join = path.join;
var resolve = path.resolve;
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-element-resize-detector',

  included: function(app, parentAddon) {
    this._super.apply(this, arguments);
  
    // Quick fix for add-on nesting
    // https://github.com/aexmachina/ember-cli-sass/blob/v5.3.0/index.js#L73-L75
    // see: https://github.com/ember-cli/ember-cli/issues/3718
    while (app.app || app.parent) {
      app = app.app || app.parent;
    }

    // if app.import and parentAddon are blank, we're probably being consumed by an in-repo-addon
    // or engine, for which the "bust through" technique above does not work.
    if (typeof app.import !== 'function' && !parentAddon) {
      if (app.registry && app.registry.app) {
        app = app.registry.app;
      }
    }

    if (!parentAddon && typeof app.import !== 'function') {
      throw new Error('ember-cli-resize-detector is being used within another addon or engine and is'
        + ' having trouble registering itself to the parent application.');
    }

    if (!process.env.EMBER_CLI_FASTBOOT) {
      app.import('vendor/element-resize-detector/element-resize-detector.js');
    }
  },

  treeForVendor: function(tree) {
    var trees = [];

    if (tree) {
      trees.push(tree);
    }

    var erdSrc = dirname(require.resolve('element-resize-detector'));
    var erdPath = resolve(join(erdSrc, '..', 'dist'));
    var erdTree = new Funnel(this.treeGenerator(erdPath), {
      srcDir: '/',
      files: ['element-resize-detector.js'],
      destDir: 'element-resize-detector'
    });

    trees.push(erdTree);

    return mergeTrees(trees);
  }
};
