describe( 'FibExporter Tests!', function () {

  var FibExporter

  beforeEach( function() {
    FibExporter = require( '../lib/fib_exporter.js' ).FibExporter
    FibHelper = require( '../lib/fib_helper.js' ).FibHelper
    FibExtractor = require( '../lib/fib_extractor.js' ).FibExtractor

    fw._resetMockDom( fw._mockDOM )
    fw.selection = []
  })

  describe( 'Basic Fib Testing', function () {
    it( 'should have a FibExporter object', function () {
      expect( FibExporter ).not.toEqual( 'undefined' )
    })
  })

  describe( 'Test the exportDOM function', function () {

    var files, cSpy, oSpy, wSpy, clSpy, utf8Spy

    beforeEach( function () {
      cSpy = spyOn( Files, 'createFile' )
      oSpy = spyOn( Files, 'open' ).andCallThrough()
      utf8Spy = spyOn( fw._mockFile, 'writeUTF8' )
      wSpy = spyOn( fw._mockFile, 'write' )
      clSpy = spyOn( fw._mockFile, 'close' )
      fw._mockDOM.topLayers = [ new Text({ name: 'id:BigTest' })]
      FibExporter.exportDOM( fw.getDocumentDOM(), '~/TestDir/' )
    })

    afterEach( function () {
    })

    it( 'should export a label and write the json to file', function() {
      // might want to change this test and serialize an object here
      // as well.  Editing this string ain't fun
      expect( utf8Spy ).toHaveBeenCalledWith(
        dojo.toJson([{
          "left": 0,
          "top": 0,
          "width": 320,
          "height": 460,
          "backgroundColor": "#ffffff",
          "id": "__TestView_root_view",
          "type": "view",
          "children": [{
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
          }]
        }], false, '' ))
    })

    it( 'should never call the write command', function() {
      expect( wSpy ).not.toHaveBeenCalled()
    })

    it( 'should open a file in the mock Test View Directory', function() {
      expect( cSpy )
        .toHaveBeenCalledWith( '~/TestDir/json/TestView.json',
          'json', 'FWMX' )
    })
  })

  describe('The createRootView function', function() {
    var fibHelper, view

    beforeEach( function() {
      fibHelper = FibHelper.createFibHelper( fw.getDocumentDOM(),
        'test', false )
      view = FibExporter.createRootView( fw.getDocumentDOM(),
        fibHelper )
    })

    it( 'export at 0 left', function() {
      expect( view.left ).toEqual( 0 );
    })

    it( 'export at 0 top ', function() {
      expect( view.top ).toEqual( 0 );
    })

    it( 'export a 320 width view', function() {
      expect( view.width ).toEqual( 320 );
    })

    it( 'export a 460 height view', function() {
      expect( view.height ).toEqual( 460 );
    })

    it( 'export a white background', function() {
      expect( view.backgroundColor ).toEqual( '#ffffff' );
    })

  });

  describe('Testing exportPage/exportAll.', function() {

    beforeEach( function() {
      spyOn( FibExporter, 'exportDOM' )
    })

    describe('The exportPage function', function() {

      it( 'should call getResourceDir', function() {
        spyOn( FibHelper, 'getResourceDir' )
        FibExporter.exportPage()
        expect( FibHelper.getResourceDir ).toHaveBeenCalled()
      })

      it( 'should call exportDOM once', function() {
        FibExporter.exportPage()
        expect( FibExporter.exportDOM.callCount).toEqual( 1 )
      })

      it( 'should return false if getResourceDir fails', function() {
        spyOn( FibHelper, 'getResourceDir' ).andReturn( undefined )
        expect( FibExporter.exportPage() ).toEqual( false )
      })

    })
    
    describe('The exportAll function', function() {

      it( 'should call getResourceDir', function() {
        spyOn( FibHelper, 'getResourceDir' )
        FibExporter.exportAll()
        expect( FibHelper.getResourceDir ).toHaveBeenCalled()
      })

      it( 'should call exportDOM four times', function() {
        fw._mockDOM.pagesCount = 4
        FibExporter.exportAll()
        expect( FibExporter.exportDOM.callCount).toEqual( 4 )
      })

      it( 'should return false if getResourceDir fails', function() {
        spyOn( FibHelper, 'getResourceDir' ).andReturn( undefined )
        expect( FibExporter.exportAll() ).toEqual( false )
      })
    })
  })
})
