//
// Copyright Massive Health, llc, 2011
//

fw = require("./spec_helpers/FwMock").fw;
FwArray = require("./spec_helpers/FwMock").FwArray;
Group = require("./spec_helpers/FwMock").Group;
Image = require("./spec_helpers/FwMock").Image;
Instance = require("./spec_helpers/FwMock").Instance;
Layer = require("./spec_helpers/FwMock").Layer;
RectanglePrimitive = require("./spec_helpers/FwMock").RectanglePrimitive;
Path = require("./spec_helpers/FwMock").Path;
Text = require("./spec_helpers/FwMock").Text;

var jasmine = require('jasmine-node');
var sys = require('sys');

alert = function(str) {};

dojo = require('./spec_helpers/spec_dojo.js').dojo;
dojo.require = function(str) {};
dojo.provide = function(str) {};

for(var key in jasmine) {
  global[key] = jasmine[key];
}

var isVerbose = false;
var showColors = true;
process.argv.forEach(function(arg){
  switch(arg) {
  case '--color': showColors = true; break;
  case '--noColor': showColors = false; break;
  case '--verbose': isVerbose = true; break;
  }
});

var options = {}
options.specFolder = __dirname + '/spec'
options.isVerbose = isVerbose
options.showColors = showColors
options.onComplete = function(runner, log){
  var exit = function() {
    process.exit( runner.results().failedCount );
  };

  if ( require( 'tty' ).isatty() ) {
    process.stdout.on( 'drain', exit );
  } else {
    exit();
  }
}

jasmine.executeSpecsInFolder(options)

