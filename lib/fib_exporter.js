if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_exporter' )


var FibExporter = {}

FibExporter.exportDOM = function ( dom, resourceDir, hasAlerts ) {

  if( !dom ) return false

  var fibHelper = FibHelper.createFibHelper( dom, resourceDir, hasAlerts )
  
  if( !fibHelper ) return false

  var fibExtractor = FibExtractor.createFibExtractor( fibHelper )

  Files.deleteFileIfExisting( fibHelper.getFullImagesDir() )
  Files.createDirectory( fibHelper.getFullImagesDir() )

  var objTree = fibExtractor.extractObjects( dom.topLayers || dom.layers )
  var rootView = FibExporter.createRootView( dom )
  rootView.children = objTree

  var filename = fibHelper.getPageName() + '.json'
  
  Files.deleteFileIfExisting( fibHelper.getFullJSONDir() + filename )
  Files.createFile( fibHelper.getFullJSONDir() + filename, 'json', 'FWMX' )
  var file = Files.open( fibHelper.getFullJSONDir() + filename, true )

  file.writeUTF8(dojo.toJson( [ rootView ], true, '  ' ))
  file.close()

  fibHelper.cleanup()

}

FibExporter.createRootView = function( dom ) {

  var viewObject

  viewObject = {
    width: dom.width,
    height: dom.height,
    backgroundColor: dom.backgroundColor,
    type: 'view'
  }

  return viewObject
}

FibExporter.exportPage = function() {

  var resourceDir = FibHelper.getResourceDir()

  if ( typeof resourceDir === 'undefined' ) return false

  FibExporter.exportDOM( fw.getDocumentDOM(), resourceDir, true )

  return true
}

FibExporter.exportAll = function() {

  var resourceDir = FibHelper.getResourceDir()
  if ( typeof resourceDir === 'undefined' ) return false

  var dom = fw.getDocumentDOM()

  for( var i = 0; i < dom.pagesCount; i++ ) {
    dom.changeCurrentPage( i )
    FibExporter.exportDOM( fw.getDocumentDOM(), resourceDir, false )
  }

  return true
}

FibExporter.exportCommandLine = function( pngFile, resourceDir ) {
  fw.openDocument( pngFile, true )

  var dom = fw.getDocumentDOM()

  for( var i = 0; i < dom.pagesCount; i++ ) {
    dom.changeCurrentPage( i )
    FibExporter.exportDOM( fw.getDocumentDOM(), resourceDir, false )
  }

  fw.closeDocument( dom )

  return true
}

if ( fw._mockFile ) exports.FibExporter = FibExporter

