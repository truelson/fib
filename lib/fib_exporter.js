if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_exporter' )


var FibExporter = {}

FibExporter.exportDOM = function ( dom ) {

  if( !dom ) return false

  FibHelper.resetCounter()
  
  Files.deleteFileIfExisting( FibHelper.getFullImagesDir() )
  Files.createDirectory( FibHelper.getFullImagesDir() )

  var objTree = FibExtractor.extractObjects( dom.topLayers || dom.layers )

  var filename = FibHelper.getPageName() + '.json'
  
  Files.deleteFileIfExisting( FibHelper.getFullJSONDir() + filename )
  Files.createFile( FibHelper.getFullJSONDir() + filename, 'json', 'FWMX' )
  var file = Files.open( FibHelper.getFullJSONDir() + filename, true )

  file.writeUTF8(dojo.toJson( objTree, true, '  ' ))
  file.close()

  FibHelper.cleanup()

}

if ( fw._mockFile ) exports.FibExporter = FibExporter

