if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_helper' )

FibHelper = {}


FibHelper.getResourceDirs = function () {

  FibHelper.dom = fw.getDocumentDOM()
  FibHelper.pageName = fw.getDocumentDOM().pageName.replace( / /,'_' )

  FibHelper.resourcesDir = 
    fw.browseForFolderURL( 'Choose the App Resource Dir' )

  if ( FibHelper.resourcesDir === null ) return false

  FibHelper.resourcesDir = FibHelper.resourcesDir + '/'

  FibHelper.imagesDir = 'images/' + FibHelper.pageName + '/'
  FibHelper.fullImagesDir = FibHelper.resourcesDir + FibHelper.imagesDir
  FibHelper.jsonDir = 'json/'
  FibHelper.fullJSONDir = FibHelper.resourcesDir + FibHelper.jsonDir

  return true
}

FibHelper.objectType = function( obj ) {

  if ( typeof obj !== 'object') return null

  // *HACK here.  Use toString first to see if it returns
  // [object <type>]
  // if not, use the old type.
  // this allows us to override type in our mocks
  var name = obj.toString()

  if ( !name.match(/^\[object / )) { 
    name = Object.prototype.toString.call( obj )
  }

  name = name.replace( /\[object /, '' )
  name = name.replace( /\]/, '' )
  
  return name
}


FibHelper.nameMap = {}
FibHelper.counter = {}

FibHelper.resetCounter = function () {
  FibHelper.counter['Text'] = 0
  FibHelper.counter['Button'] = 0
  FibHelper.counter['Group'] = 0
  FibHelper.counter['Image'] = 0
  FibHelper.counter['Instance'] = 0
  FibHelper.counter['Path'] = 0
  FibHelper.counter['RectanglePrimitive'] = 0
  FibHelper.counter['Undefined'] = 0
  FibHelper.nameMap = {}
}
FibHelper.resetCounter()


FibHelper.getUniqueName = function ( obj ) {
  var type = FibHelper.objectType( obj )
  ,   name

  if( type in FibHelper.counter ) {
    FibHelper.counter[type]++
    name = '__' + FibHelper.pageName + type + FibHelper.counter[type]

  } else {
    counter['Undefined']++
    name = '__' + FibHelper.pageName + 'Undefined' +
      counter['Undefined']
  }

  return name
}

FibHelper.isNameUnique = function ( curName ) {
  return ( !FibHelper.nameMap.hasOwnProperty( curName ))
}

FibHelper.cloneAndCut = function cloneAndCut( obj ) {

  fw.selection = [ obj ]
  FibHelper.dom.clipCopy()
  
  return FibHelper.getActualSize( obj )
}

FibHelper.createAndPaste = function createAndPaste( bounds ) {

  var old_dom

  old_dom = fw.getDocumentDOM()

  if ( !FibHelper.sandboxDOM ) {
    fw.createDocument()

    FibHelper.sandboxDOM = fw.getDocumentDOM()
    FibHelper.sandboxDOM.backgroundColor = '#ffffff00'
    FibHelper.sandboxDOM.exportOptions.colorMode = '32 bit'
    FibHelper.sandboxDOM.exportOptions.exportFormat = 'PNG'

    FibHelper.sandboxDOM.setDocumentResolution({
      pixelsPerUnit: old_dom.resolution,
      units: old_dom.resolutionUnits
    })
  }
  
  FibHelper.sandboxDOM.clipPaste('do not resample')

  var obj = FibHelper.sandboxDOM.layers[0].elems[0]
  bounds = FibHelper.getActualSize( obj )

  FibHelper.sandboxDOM.setDocumentCanvasSize( bounds, true )

  return FibHelper.sandboxDOM
}


FibHelper.exportPNG = function ( obj, name ) {
  if( !obj ) return

  var old_selection = fw.selection

  var bounds = FibHelper.cloneAndCut( obj )
  var new_dom = FibHelper.createAndPaste( bounds )

  fw.exportDocumentAs( new_dom, FibHelper.fullImagesDir + name + '.png',
    null )

  FibHelper.sandboxDOM.deleteAllInDocument()
  FibHelper.dom.makeActive()

  fw.selection = old_selection

}

FibHelper.getActualSize = function getActualSize( obj ) {
  var size = {}

  size.top = obj.top
  size.left = obj.left
  size.width = obj.width
  size.height = obj.height
  size.right = obj.left + obj.width
  size.bottom = obj.top + obj.height

  if ( FibHelper.objectType( obj ) === 'RectanglePrimitive' &&
    obj.pathAttributes &&
    !obj.pathAttributes.brush && !obj.pathAttributes.fill ) {
    return size
  }

  if ( obj.pixelRect ) {
    size.top = Math.min( size.top, obj.pixelRect.top )
    size.bottom = Math.max( size.bottom, obj.pixelRect.bottom )
    size.left = Math.min( size.left, obj.pixelRect.left )
    size.right = Math.max( size.right, obj.pixelRect.right )
    size.height = size.bottom - size.top
    size.width = size.right - size.left
  }

  return size
}

FibHelper.shortenFont = function( object ) {

  if ( !object || !object.font || !object.font.fontFamily ) return object

  var fontName = object.font.fontFamily

  // Shorten fonts listed here as iphone only supports two or less
  // fonts of the same family and we get around that by creating
  // a 'new' font family by getting rid of the hyphen
  // List all fonts in this array you want 'shortened'
  _([ 'Gotham' ]).each( function( currentFont ) {
    if ( 0 === fontName.indexOf( currentFont )) {
      object.font.fontFamily = fontName.replace( /-/g, '' )
      return object
    }
  })

  return object
}

FibHelper.parseMetadata = function ( metaString ) {

  var metadata = null
  var name

  if( !metaString || metaString === '' ) return {}

  metaString = metaString.replace( /\;/g, '' )

  if( !(metaString.match( /:/ ))) {
    metaString = metaString.replace( /\ /g, '_' )
    return { id: metaString }
  }

  metaString = metaString.replace( /\ /g, '' )
  metaString = metaString.replace( /:/g, '\":\"' )
  metaString = metaString.replace( /,/g, '\",\"' )

  metaString = '{\"' + metaString + '\"}'

  try {
    metadata = dojo.fromJson( metaString )
  } catch ( e ) {
    alert( 'Your Mom\'s poorly formatted string: ' + metaString )
  }

  return metadata
}

FibHelper.cleanup = function cleanup() {
  if ( FibHelper.sandboxDOM ) {
    FibHelper.sandboxDOM.close( false )
    FibHelper.sandboxDOM = null
  }
}

if ( fw._mockFile ) exports.FibHelper = FibHelper
