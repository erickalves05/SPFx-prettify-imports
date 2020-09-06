'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
const fs = require("fs");

const path = require('path');
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {

    if(!generatedConfiguration.resolve.alias){
      generatedConfiguration.resolve.alias = {};
    }

    // web part specific components folder
    generatedConfiguration.resolve.alias['@hello-world-components'] = path.resolve( __dirname, 'lib/webparts/helloWorld/components/')

    // shared components
    generatedConfiguration.resolve.alias['@components'] = path.resolve( __dirname, 'lib/shared/components/')

    //root src folder
    generatedConfiguration.resolve.alias['@src'] = path.resolve( __dirname, 'lib')

    fs.writeFileSync("./temp/_webpack_config.json", JSON.stringify(generatedConfiguration, null, 2)); // <-- the needed line

    return generatedConfiguration;
  }
});

const argv = build.rig.getYargs().argv;
const useCustomServe = argv['custom-serve'];
const workbenchApi = require("@microsoft/sp-webpart-workbench/lib/api");

if (useCustomServe) {
  build.tslintCmd.enabled = false;

  const ensureWorkbenchSubtask = build.subTask('ensure-workbench-task', function (gulp, buildOptions, done) {
    this.log('Creating workbench.html file...');
    try {
      workbenchApi.default["/workbench"]();
    } catch (e) { }

    done();
  });

  build.rig.addPostBuildTask(build.task('ensure-workbench', ensureWorkbenchSubtask));
}

build.initialize(require('gulp'));

