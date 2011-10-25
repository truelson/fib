/* File: FwMock.js
 * Authors: Palmer Truelson 
 * Company: Massive Health, LLC
 * Licence: $LICENSE
 * About: Fireworks Mock Classes. Allows us to run unit tests on 
 *  fireworks files 
 */
// add underscore
_ = require('../lib/underscore.js')

// it all starts with an object
fw = {}
exports.fw = fw

fw._mockHelpers = {}
fw.selection = []

fw._mockHelpers.setBasics = function (obj) {
  obj.height = 0
  obj.isLayer = false
  obj.left = 0
  obj.name = null
  obj.top = 0
  obj.width = 0
  obj.visible = true
  obj.opacity = 100
  obj.pathAttributes = {
    brush: {
      brushColor: '#FFFFFF',
    },

    fill: {
      fillColor: '#FFFFFF',
      name: 'Solid',
      textureBlend: 0
    }
  }
}

// FwArray
var FwArray = function( obj ) {
}
FwArray.prototype.toString = function() {
  return '[object FwArray]'
}
exports.FwArray = FwArray

// Group
var Group = function (spec) {
  fw._mockHelpers.setBasics(this)
  if(spec) {
    _.extend(this, spec)
  }
}
Group.prototype.toString = function () {
  return '[object Group]'
}
exports.Group = Group

// Image
var Image = function (spec) {
  fw._mockHelpers.setBasics(this)
  if(spec) {
    _.extend(this, spec)
  }
}
Image.prototype.toString = function () {
  return '[object Image]'
}
exports.Image = Image

// Instances
var Instance = function (spec) {
  fw._mockHelpers.setBasics(this)
  this.transform = { matrix: [1, 0, 0, 0, 1, 0, 10, 20, 1] } 

  if(spec) {
    _.extend(this, spec)
  }
}
Instance.prototype.toString = function () {
  return '[object Instance]'
}
exports.Instance = Instance

var RectanglePrimitive = function (spec) {
  fw._mockHelpers.setBasics(this)
  this.roundness = 0
  this.pathAttributes = {
    fillColor: '#ff0000',
    fill: {
      name: 'Solid',
      textureBlend: 0
    },
    brushColor: '#00ff00',
    brush: { diameter: 1 }
  }
  if(spec) _.extend(this, spec) 
}
RectanglePrimitive.prototype.toString = function () {
  return '[object RectanglePrimitive]'
}
exports.RectanglePrimitive = RectanglePrimitive

var Path = function( spec ) {
  fw._mockHelpers.setBasics( this )
  this.pathAttributes = {
    fillColor: '#ff0000',
    brushColor: '#00ff00',
    brush: { diameter: 1 }
  }
  this.contours = []
  if( spec ) _.extend(this, spec)
}
Path.prototype.toString = function () {
  return '[object Path]'
}
exports.Path = Path

// Layer
var Layer = function (spec) {
  this.elems = []
  this.isLayer = true 
  this.layerType = 'normal' 
  this.name = null
  this.visible = true

  if(spec) {
    _.extend(this, spec)
  }
}
Layer.prototype.toString = function () {
  return '[object Layer]'
}
exports.Layer = Layer

// Text
var Text = function (spec) {
  fw._mockHelpers.setBasics(this)
  this.alignment = 'left'
  this.pathAttributes = {
    fillColor: '#ff0000'
  },
  this.font = ''
  this.fontsize = 0
  this.name = null
  this.textChars = ''

  if(spec) {
    _.extend(this, spec)
  }
}
Text.prototype.toString = function () {
  return '[object Text]'
}
exports.Text = Text

fw._resetMockDom = function(d) {
  d.pageName = 'TestView'
  d.width = 320
  d.height = 460
  d.backgroundColor = '#ffffff'
  d.exportOptions = {
    colorMode: '32 bit'
  }
  d.resolution = 300
  d.resolutionUnits = 1

  return d
}

var mockLayer = {
  elems: [ ]
}

var mockCopyObj

fw.createDocument = function() {
  return fw._resetMockDom({
    // dom functions
    exportElements: function (elems, file, imageDir, name) {},

    cloneSelection: function() {
      mockCopyObj = fw.selection
    },
    flattenSelection: function() {},
    getSelectionBounds: function() {return {}},

    clipCut: function() {},
    clipCopy: function() {
      mockCopyObj = fw.selection
    },
    clipPaste: function() {
      mockLayer.elems.push(mockCopyObj)
    },

    close: function() {},
    moveSelectionTo: function() {},

    setDocumentResolution: function() {},
    setDocumentCanvasSize: function() {},
    setDocumentImageSize: function() {},

    deleteAllInDocument: function() {},
    makeActive: function() {},

    scaleSelection: function() {},
    transformSelection: function() {},

    selectAll: function() {},

    layers: [mockLayer],

    changeCurrentPage: function( pageIndex ) {}
  })
}

fw._mockDOM = fw.createDocument()
fw.getDocumentDOM = function () {return fw._mockDOM}
fw.exportDocumentAs = function () {}

fw.runScript = function (scriptName) {}
fw.currentScriptDir = './'

fw.browseForFolderURL = function (name, hint) { return '~/TestDir' }

// Mocks of Fireworks class objects

// File accessing mocks
fw._mockFile = {}
fw._mockFile.mockPath = ''
fw._mockFile.write = function (text) {}
fw._mockFile.writeUTF8 = function (text) {}
fw._mockFile.close = function () {}

Files = {}
exports.Files = Files

Files.createFile = function (name, type, from) {}
Files.createDirectory = function (name) {}
Files.deleteFileIfExisting = function (name) {}
Files.makePathFromDirAndFile = function (dir, name) { return dir + name }

Files.exists = function ( path ) {}
Files.open = function (path, canWrite) {
  fw._mockFile.mockPath = path
  fw._mockFile.canWrite = (canWrite || false)
  return fw._mockFile
}

