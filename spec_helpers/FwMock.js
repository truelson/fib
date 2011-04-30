/* File: FwMock.js
 * Authors: Palmer Truelson 
 * Company: Massive Health, LLC
 * Licence: $LICENSE
 * About: Fireworks Mock Classes. Allows us to run unit tests on 
 *  fireworks files 
 */

// it all starts with an object
fw = {};
exports.fw = fw;

fw._mockHelpers = {};
fw.selection = [];

fw._resetMockDom = function(d) {
  d.pageName = 'TestView';
  d.width = 320;
  d.height = 480;
  d.backgroundColor = '#ffffff';
  d.exportOptions = {
    colorMode: '32 bit'
  }
  d.resolution = 300;
  d.resolutionUnits = 1;

  return d;
};

fw.createDocument = function() {
  return fw._resetMockDom({
    // dom functions
    exportElements: function (elems, file, imageDir, name) {},

    cloneSelection: function() {},
    flattenSelection: function() {},
    getSelectionBounds: function() {return {};},

    clipCut: function() {},
    clipPaste: function() {},

    close: function() {},
    moveSelectionTo: function() {},

    setDocumentResolution: function() {},
    setDocumentCanvasSize: function() {}
  });
};

fw._mockDOM = fw.createDocument();
fw.getDocumentDOM = function () {return fw._mockDOM;};
fw.exportDocumentAs = function () {};

fw.runScript = function (scriptName) {};
fw.currentScriptDir = './';

fw.browseForFolderURL = function (name, hint) { return '~/TestDir'; };

// Mocks of Fireworks class objects

fw._mockHelpers.setBasics = function (obj) {
  obj.height = 0;
  obj.isLayer = false;
  obj.left = 0;
  obj.name = null;
  obj.top = 0;
  obj.width = 0;
  obj.visible = true;
}

// Group
var Group = function (spec) {
  fw._mockHelpers.setBasics(this);
  if(spec) {
    dojo.mixin(this, spec);
  }
}
Group.prototype.toString = function () {
  return '[object Group]';
}
exports.Group = Group;

// Image
var Image = function (spec) {
  fw._mockHelpers.setBasics(this);
  if(spec) {
    dojo.mixin(this, spec);
  }
}
Image.prototype.toString = function () {
  return '[object Image]';
}
exports.Image = Image;

// Instances
var Instance = function (spec) {
  fw._mockHelpers.setBasics(this);
  this.transform = { matrix: [1, 0, 0, 0, 1, 0, 10, 20, 1] }; 

  if(spec) {
    dojo.mixin(this, spec);
  }
}
Instance.prototype.toString = function () {
  return '[object Instance]';
}
exports.Instance = Instance;

var RectanglePrimitive = function (spec) {
  fw._mockHelpers.setBasics(this);
  if(spec) {
    dojo.mixin(this, spec);
  }
}
RectanglePrimitive.prototype.toString = function () {
  return '[object RectanglePrimitive]';
}
exports.RectanglePrimitive = RectanglePrimitive;

// Layer
var Layer = function (spec) {
  this.elems = []; 
  this.isLayer = true; 
  this.layerType = 'normal'; 
  this.name = null;
  this.visible = true;

  if(spec) {
    dojo.mixin(this, spec);
  }
};
Layer.prototype.toString = function () {
  return '[object Layer]';
}
exports.Layer = Layer;

// Text
var Text = function (spec) {
  fw._mockHelpers.setBasics(this);
  this.alignment = 'left';
  this.pathAttributes = {
    fillColor: '#ff0000'
  },
  this.font = '';
  this.fontsize = 0;
  this.name = null;
  this.textChars = '';

  if(spec) {
    dojo.mixin(this, spec);
  }
};
Text.prototype.toString = function () {
  return '[object Text]';
}
exports.Text = Text;

// File accessing mocks
fw._mockFile = {};
fw._mockFile.mockPath = '';
fw._mockFile.write = function (text) {};
fw._mockFile.writeUTF8 = function (text) {};
fw._mockFile.close = function () {};

Files = {};
exports.Files = Files;

Files.createFile = function (name, type, from) {};
Files.createDirectory = function (name) {};
Files.deleteFileIfExisting = function (name) {};

Files.open = function (path, canWrite) {
  fw._mockFile.mockPath = path;
  fw._mockFile.canWrite = (canWrite || false);
  return fw._mockFile;
};

