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

  var filename = fibHelper.getPageName() + '.json'
  
  Files.deleteFileIfExisting( fibHelper.getFullJSONDir() + filename )
  Files.createFile( fibHelper.getFullJSONDir() + filename, 'json', 'FWMX' )
  var file = Files.open( fibHelper.getFullJSONDir() + filename, true )

  file.writeUTF8(dojo.toJson( objTree, true, '  ' ))
  file.close()

  fibHelper.cleanup()

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

if ( fw._mockFile ) exports.FibExporter = FibExporter

