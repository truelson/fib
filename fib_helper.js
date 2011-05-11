/* File: fib_helper.js
 * Authors: Palmer Truelson 
 * Company: Massive Health, LLC
 * Licence: $LICENSE
 */

FibHelper = {}

FibHelper.getPageName = function() {
  return fw.getDocumentDOM().pageName.replace(/ /,'_')
}

FibHelper.getResourceDirs = function () {

  var page_name = FibHelper.getPageName();

  FibHelper.resourcesDir = 
    fw.browseForFolderURL('Choose the App Resource Dir');

  if (FibHelper.resourcesDir === null) {
    return false;
  };
  FibHelper.resourcesDir = FibHelper.resourcesDir + '/';

  // set our module convenience variables
  FibHelper.imagesDir = 'images/' + page_name + '/';
  FibHelper.fullImagesDir = FibHelper.resourcesDir + FibHelper.imagesDir;
  FibHelper.jsonDir = 'json/';
  FibHelper.fullJSONDir = FibHelper.resourcesDir + FibHelper.jsonDir;
  return true;
}

// Gets type of object from toString returned
FibHelper.objType = function(obj) {
  if (typeof obj !== 'object') {
    return null;
  }

  // *HACK here.  Use to string first to see if it returns
  // [object <type>]
  // if not, use the old type.
  // this allows us to override type in our mocks
  var name = obj.toString();
  if (!name.match(/^\[object /)) { 
    // Use the object prototype toString.  This always works.
    name = Object.prototype.toString.call(obj);
  }
  name = name.replace(/\[object /, '');
  name = name.replace(/\]/, '');
  
  return name;
};


// Get unique name for objects without names
// adding external access to function for testing purposes
FibHelper.nameMap = {};
FibHelper.counter = {};

FibHelper.resetCounter = function () {
  FibHelper.counter['Text'] = 0;
  FibHelper.counter['Button'] = 0;
  FibHelper.counter['Group'] = 0;
  FibHelper.counter['Image'] = 0;
  FibHelper.counter['Instance'] = 0;
  FibHelper.counter['Path'] = 0;
  FibHelper.counter['RectanglePrimitive'] = 0;
  FibHelper.counter['Undefined'] = 0;
  FibHelper.nameMap = {};
};
FibHelper.resetCounter();


FibHelper.getUniqueName = function (obj) {
  var type = FibHelper.objType(obj);
  var name;
  if(type in FibHelper.counter) {
    FibHelper.counter[type]++;
    name = '__' + FibHelper.getPageName() + type + FibHelper.counter[type];  
  } else {
    counter['Undefined']++;
    name = '__' + FibHelper.getPageName() + 'Undefined' + 
      counter['Undefined'];
  }
  return name;  
};

FibHelper.isNameUnique = function (curName)
{
  return (!(FibHelper.nameMap.hasOwnProperty(curName)));
};

FibHelper.cloneAndCut = function cloneAndCut(obj) {
  var bounds;
  
  var old_selection = fw.selection;
  fw.selection = obj;

  fw.getDocumentDOM().cloneSelection();
  bounds = FibHelper.getActualSize(obj);
  fw.getDocumentDOM().clipCut();

  fw.selection = old_selection;
  
  return bounds;
};

FibHelper.createAndPaste = function createAndPaste(bounds) {
  var old_dom, new_dom;

  old_dom = fw.getDocumentDOM();

  fw.createDocument();
  new_dom = fw.getDocumentDOM();

  // set the export options
  new_dom.backgroundColor = '#ffffff00';
  new_dom.exportOptions.colorMode = '32 bit';
  new_dom.exportOptions.exportFormat = 'PNG';
  new_dom.setDocumentResolution({
    pixelsPerUnit: old_dom.resolution,
    units: old_dom.resolutionUnits
  });
  
  new_dom.clipPaste('do not resample');

  var obj = new_dom.layers[0].elems[0];
  bounds = FibHelper.getActualSize(obj);

  // set the canvas size to the selection size and paste
  new_dom.setDocumentCanvasSize(bounds, true);

  return new_dom;
};

// exporting files via dom export elements
FibHelper.exportPNG = function (obj, name) {
  if(!obj) {
    return; 
  }

  var bounds = FibHelper.cloneAndCut(obj);
  var new_dom = FibHelper.createAndPaste(bounds);

  fw.exportDocumentAs(new_dom, FibHelper.fullImagesDir + name + '.png', 
    null);

  new_dom.close(false);
}

FibHelper.getActualSize = function getActualSize(obj) {
  var size = {};

  size.top = obj.top;
  size.left = obj.left;
  size.width = obj.width;
  size.height = obj.height;
  size.right = obj.left + obj.width;
  size.bottom = obj.top + obj.height;


  if (obj.pixelRect) {
    size.top = Math.min(size.top, obj.pixelRect.top);
    size.bottom = Math.max(size.bottom, obj.pixelRect.bottom);
    size.left = Math.min(size.left, obj.pixelRect.left);
    size.right = Math.max(size.right, obj.pixelRect.right);
    size.height = size.bottom - size.top;
    size.width = size.right - size.left;
  }

  return size;
};

// only export if this is a test
if (fw._mockFile) {
  exports.FibHelper = FibHelper;
}
