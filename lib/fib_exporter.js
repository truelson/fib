if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_exporter' )


var FibExporter = {}

FibExporter.exportDOM = function ( dom ) {

  if( !dom ) return false

  FibHelper.resetCounter()
  
  Files.deleteFileIfExisting( FibHelper.fullImagesDir )
  Files.createDirectory( FibHelper.fullImagesDir )

  var objTree = FibExtractor.extractObjects( dom.topLayers || dom.layers )

  var filename = FibHelper.pageName + '.json'
  
  Files.deleteFileIfExisting( FibHelper.fullJSONDir + filename )
  Files.createFile( FibHelper.fullJSONDir + filename, 'json', 'FWMX' )
  var file = Files.open( FibHelper.fullJSONDir + filename, true )

  file.writeUTF8(dojo.toJson( objTree, true, '  ' ))
  file.close()

  FibHelper.cleanup()

}

if ( fw._mockFile ) exports.FibExporter = FibExporter

