'use strict';

const GlimmerApp = require('@glimmer/application-pipeline').GlimmerApp;
const replace = require('rollup-plugin-replace');

module.exports = function(defaults) {
  let app = new GlimmerApp(defaults, {
    rollup: {
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify( 'production' )
        })
      ]
    }
  });

  // TODO https://github.com/glimmerjs/glimmer-application-pipeline/issues/41

  return app.toTree();
};
