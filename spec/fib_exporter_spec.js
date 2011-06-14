describe( 'FibExporter Tests!', function () {

  var FibExporter, FibExtractor, FibHelper

  beforeEach( function() {
    FibExporter = require( '../lib/fib_exporter.js' ).FibExporter
    FibExtractor = require( '../lib/fib_extractor.js' ).FibExporter
    FibHelper = require( '../lib/fib_helper.js' ).FibHelper
    FibHelper.getResourceDirs()

    fw._resetMockDom( fw._mockDOM )
    fw.selection = []
  })

  describe( 'Basic Fib Testing', function () {
    it( 'should have a FibExporter object', function () {
      expect( FibExporter ).not.toEqual( 'undefined' )
    })
  })

  describe( 'Test the full export function', function () {

    var files, cSpy, oSpy, wSpy, clSpy, utf8Spy

    beforeEach( function () {
      cSpy = spyOn( Files, 'createFile' )
      oSpy = spyOn( Files, 'open' ).andCallThrough()
      utf8Spy = spyOn( fw._mockFile, 'writeUTF8' )
      wSpy = spyOn( fw._mockFile, 'write' )
      clSpy = spyOn( fw._mockFile, 'close' )
      fw._mockDOM.topLayers = [ new Text({ name: 'BigTest' })]
      FibExporter.exportDOM( fw.getDocumentDOM() )
    })

    afterEach( function () {
      FibHelper.resetCounter()
    })

    it( 'should export a label and write the json to file', function() {
      // might want to change this test and serialize an object here
      // as well.  Editing this string ain't fun
      expect( utf8Spy ).toHaveBeenCalledWith(
        dojo.toJson([
          {
            "left": 0,
            "top": 0,
            "height": 0,
            "width": 0,
            "opacity": 1,
            "id":"BigTest",
            "type":"label",
            "textAlign":"left",
            "color":"#ff0000",
            "font":{"fontFamily":"","fontSize":0 },
            "text":""
          }
        ], true, '  ' ))
    })

    it( 'should never call the write command', function() {
      expect( wSpy ).not.toHaveBeenCalled()
    })

    it( 'should open a file in the mock Test View Directory', function() {
      expect( cSpy )
        .toHaveBeenCalledWith( '~/TestDir/json/TestView.json',
          'json',
          'FWMX' )
    })
  })
})
