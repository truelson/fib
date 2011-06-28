if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_helper' )

var FibHelper = {}

FibHelper.catchException = function( exception ) {

  if( typeof exception !== 'object' ) {
    alert( 'You likely did not choose a proper Resources directory.  '
      + 'Otherwise Fireworks failed and offered only this as information:'
      + exception)
  } else {
    alert( 'Fib script failed.\n'
      + 'Line Number: ' + exception.lineNumber + '\n'
      + 'File Name: ' + exception.fileName + '\n'
      + 'Message: ' + exception.message )
  }

  if ( FibHelper.lastHelper && FibHelper.lastHelper.cleanup )
    FibHelper.lastHelper.cleanup()
}

FibHelper.getResourceDir = function () {
  var resourceDir = fw.browseForFolderURL( 'Choose the App Resource Dir' )

  if ( resourceDir === null ) return

  return resourceDir + '/'
}

FibHelper.createFibHelper = function( dom, resourceDir, hasAlerts ) {

  var fibHelper = FibHelper.lastHelper = {}

  fibHelper.dom = dom

  if ( typeof resourceDir === 'undefined' ) return undefined

  fibHelper.resourceDir = resourceDir

  fibHelper.getJSONDir = function () {
    return 'json/'
  }

  fibHelper.getFullJSONDir = function () {
    return fibHelper.resourceDir + fibHelper.getJSONDir()
  }

  fibHelper.getPageName = function() {
    return fibHelper.dom.pageName.replace( / /,'_' )
  }

  fibHelper.getImagesDir = function() {
    return 'images/' + fibHelper.getPageName() + '/'
  }

  fibHelper.getFullImagesDir = function() {
    return fibHelper.resourceDir + fibHelper.getImagesDir()
  }

  fibHelper.objectType = function( obj ) {

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


  fibHelper.nameMap = {}
  fibHelper.counter = {}

  fibHelper.resetCounter = function () {
    fibHelper.counter['Text'] = 0
    fibHelper.counter['Button'] = 0
    fibHelper.counter['Group'] = 0
    fibHelper.counter['Image'] = 0
    fibHelper.counter['Instance'] = 0
    fibHelper.counter['Path'] = 0
    fibHelper.counter['RectanglePrimitive'] = 0
    fibHelper.counter['Undefined'] = 0
    fibHelper.nameMap = {}
  }
  fibHelper.resetCounter()

  var warnings = []

  fibHelper.addWarning = function( warnText ) {
    warnings.push( warnText )
  }

  // *WORKAROUND: showing warnings during exporting results in
  // crashes.  We have to show them afterward
  fibHelper.outputWarnings = function() {

    var directory = fibHelper.resourceDir + '../' + 'warnings/'

    if ( !Files.exists( directory ))
        Files.createDirectory( directory )

    var filename = fibHelper.getPageName() + '_warnings.txt'
    var fullFile = Files.makePathFromDirAndFile( directory, filename )

    Files.deleteFileIfExisting( fullFile )

    if ( warnings.length === 0 )
      return

    Files.createFile( fullFile, 'txt', 'FWMX' )
    var file = Files.open( fullFile, true )

    _( warnings ).map( function( currentWarning ) {
      file.writeUTF8( currentWarning )
    })

    file.close()

    if( hasAlerts ) {
      alert( 'You have ' + warnings.length
        + ' warnings.\n\nWe have saved all warnings to file:\n'
        + fullFile + '\n\n'
        + 'The first warning was: \n\n' + warnings[0] )
    }
  }

  fibHelper.getUniqueName = function ( obj ) {
    var type = fibHelper.objectType( obj )
    ,   name

    if( type in fibHelper.counter ) {
      fibHelper.counter[type]++
      name = '__' + fibHelper.getPageName() + type + fibHelper.counter[type]

    } else {
      fibHelper.counter['Undefined']++
      name = '__' + fibHelper.getPageName() + 'Undefined' +
        fibHelper.counter['Undefined']
    }

    return name
  }

  fibHelper.isNameUnique = function ( curName ) {
    return ( !fibHelper.nameMap.hasOwnProperty( curName ))
  }

  fibHelper.cloneAndCut = function cloneAndCut( obj ) {

    fw.selection = [ obj ]
    fibHelper.dom.clipCopy()

    return fibHelper.getActualSize( obj )
  }

  fibHelper.createAndPaste = function createAndPaste( bounds ) {

    if ( !fibHelper.sandboxDOM ) {
      fw.createDocument()

      fibHelper.sandboxDOM = fw.getDocumentDOM()
      fibHelper.sandboxDOM.backgroundColor = '#ffffff00'
      fibHelper.sandboxDOM.exportOptions.colorMode = '32 bit'
      fibHelper.sandboxDOM.exportOptions.exportFormat = 'PNG'

      fibHelper.sandboxDOM.setDocumentResolution({
        pixelsPerUnit: fibHelper.dom.resolution,
        units: fibHelper.dom.resolutionUnits
      })
    }

    fibHelper.sandboxDOM.clipPaste('do not resample')

    var obj = fibHelper.sandboxDOM.layers[0].elems[0]
    bounds = fibHelper.getActualSize( obj )

    fibHelper.sandboxDOM.setDocumentCanvasSize( bounds, true )

    return fibHelper.sandboxDOM
  }


  fibHelper.exportPNG = function ( obj, name ) {
    if( !obj ) return

    var old_selection = fw.selection

    var bounds = fibHelper.cloneAndCut( obj )
    var newDOM = fibHelper.createAndPaste( bounds )

    fw.exportDocumentAs( newDOM,
      fibHelper.getFullImagesDir() + name + '.png', null )

    newDOM.setDocumentImageSize({
      top:0, left: 0, right: 2 * newDOM.width, bottom: 2 * newDOM.height
    },
    {
      pixelsPerUnit: newDOM.resolution,
      units: newDOM.resolutionUnits
    },
    true)

    fw.exportDocumentAs( newDOM, fibHelper.getFullImagesDir() + name +
      '@2x.png', null )

    fibHelper.sandboxDOM.deleteAllInDocument()

    fibHelper.dom.makeActive()

    fw.selection = old_selection
  }

  fibHelper.getActualSize = function getActualSize( obj ) {
    var size = {}

    size.top = obj.top
    size.left = obj.left
    size.width = obj.width
    size.height = obj.height
    size.right = obj.left + obj.width
    size.bottom = obj.top + obj.height

    if ( fibHelper.objectType( obj ) === 'RectanglePrimitive' &&
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

  fibHelper.shortenFont = function( object ) {

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

  fibHelper.parseMetadata = function ( metaString ) {

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
      fibHelper.addWarning( 'Poorly formatted object string: '
        + metaString )
    }

    return metadata
  }

  fibHelper.cleanup = function cleanup() {
    if ( fibHelper.sandboxDOM ) {
      fibHelper.sandboxDOM.close( false )
      fibHelper.sandboxDOM = null
    }
    fibHelper.outputWarnings()
  }


  fibHelper.resetCounter()

  return fibHelper
}

if ( fw._mockFile ) exports.FibHelper = FibHelper
