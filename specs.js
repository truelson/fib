//
// Copyright Massive Health, llc, 2011
//

fw = require("./spec_helpers/FwMock").fw;
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

// Have to hack the directory here. not sure why.
jasmine.executeSpecsInFolder(__dirname + '/spec', function(runner, log){
  process.exit(runner.results().failedCount);
}, isVerbose, showColors);

