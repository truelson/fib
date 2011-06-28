/* File: fib_helper_spec.js
 * Authors: Palmer Truelson
 * Company: Massive Health, LLC
 * Licence: $LICENSE
 * About: Fib unit tests 
 */
describe('Fib Helper Tests!', function () {

  describe('Exception Catching Function', function() {
    it( 'should catch exception objects and alert with info', function() {
      var oldAlert = alert
      alert = createSpy()
      var except = { lineNumber: 20, fileName: 'blah', message: 'ugh' }

      FibHelper.catchException( except )
      expect( alert ).toHaveBeenCalledWith( 'Fib script failed.\n'
        + 'Line Number: ' + except.lineNumber + '\n'
        + 'File Name: ' + except.fileName + '\n'
        + 'Message: ' + except.message )

      alert = oldAlert
    })

    it( 'should throw a different alert if not an object', function() {
      var oldAlert = alert
      alert = createSpy()
      var except = 2478

      FibHelper.catchException( except )
      expect( alert ).toHaveBeenCalledWith(
        'You likely did not choose a proper Resources directory.  '
        + 'Otherwise Fireworks failed and offered only this as information:'
        + except)

      alert = oldAlert
    })

    it( 'should cleanup after if it can cleanup', function() {
      var except = 2478

      FibHelper.lastHelper = { cleanup: function() {} }
      spyOn( FibHelper.lastHelper, 'cleanup' )

      FibHelper.catchException( except )
      expect( FibHelper.lastHelper.cleanup ).toHaveBeenCalled()
    })
    
  })

  describe('OutputWarning Function', function() {

    var oldAlert, fibHelper

    beforeEach( function() {
      spyOn( Files, 'createFile' )
      spyOn( fw._mockFile, 'writeUTF8' )
      oldAlert = alert
      alert = createSpy()

    })

    afterEach( function() {
      alert = oldAlert
    })

    describe( 'output tests', function() {

      beforeEach( function() {
        fibHelper = require( '../lib/fib_helper' ).FibHelper
          .createFibHelper( fw.createDocument(), '~/TestView/', false )
      })

      it( 'should output warnings', function() {
        fibHelper.addWarning( 'blah' )
        fibHelper.outputWarnings()

        expect( Files.createFile ).toHaveBeenCalled()
        expect( fw._mockFile.writeUTF8 ).toHaveBeenCalledWith( 'blah' )
      })

      it( 'should not output anything', function() {
        fibHelper.outputWarnings()
        expect( Files.createFile ).not.toHaveBeenCalled()
        expect( fw._mockFile.writeUTF8 ).not.toHaveBeenCalled()
      })
    })

    it( 'should not call alert', function() {
      fibHelper = require( '../lib/fib_helper' ).FibHelper
        .createFibHelper( fw.createDocument(), '~/TestView/', false )
      fibHelper.addWarning( 'blah' )
      fibHelper.outputWarnings()

      expect( alert ).not.toHaveBeenCalled()
    })

    it( 'should call alert', function() {
      fibHelper = require( '../lib/fib_helper' ).FibHelper
        .createFibHelper( fw.createDocument(), '~/TestView/', true )
      fibHelper.addWarning( 'blah' )
      fibHelper.outputWarnings()

      expect( alert ).toHaveBeenCalled()
    })

  })

  describe('FibHelper object method tests', function () {

    beforeEach(function() {
      fibHelper = require( '../lib/fib_helper' ).FibHelper
        .createFibHelper( fw.createDocument(), '~/TestView/', false )
      fw.selection = []
    })

    afterEach(function() {
      fibHelper.cleanup()
    })

    it('should have a working object type function', function () {
      expect(fibHelper.objectType([])).toEqual('Array')
    })

    describe('ExportPNG function', function () {
      var img

      beforeEach(function() {
        img = new Image({ 
          name: 'TestImage', 
          left: 0,
          top: 0,
          width: 20, 
          height: 30, 
          pixelRect: { top:5, bottom:25, left: 5, right: 15 }
        })
      })

      it('should maintain selection', function () {
        fw.selection = 'test'
        fibHelper.exportPNG(img, 'TestPlace')
        expect(fw.selection).toEqual('test')
      })

      it('should set exportOptions.exportFormat to PNG', function() {
        fibHelper.exportPNG(img, 'TestPlace')
        expect(fibHelper.sandboxDOM.exportOptions.exportFormat)
          .toEqual('PNG')
      })

      it('should set canvas size to full bounds', function() {
        spyOn(fibHelper, 'getActualSize').andReturn({
          left: 0, top:0, right: 20, bottom: 30
        })
        spyOn(fw._mockDOM, 'setDocumentCanvasSize')
        fibHelper.exportPNG(img, 'TestImage')
        expect(fw._mockDOM.setDocumentCanvasSize).toHaveBeenCalledWith({
          left: 0, top:0, right: 20, bottom: 30
        }, true)
      })
    })

    describe( 'Test extract meta data function', function () {
      it( 'should return an empty object when given an empty string',
        function () {
          expect( fibHelper.parseMetadata( '' )).toEqual({})
      })

      it( 'should return empty object if no colon anywhere', function () {
        expect( fibHelper.parseMetadata( 'asdf' )).toEqual({ id: 'asdf' })
      })

      it( 'should return an object with a button type', function () {
        expect( fibHelper.parseMetadata( 'type:button' ))
          .toEqual({ type:'button' })
      })
      it( 'should return an obj w button type even with space', function () {
        expect( fibHelper.parseMetadata( 'type : button ' )).
          toEqual({ type:'button' })
      })
      it( 'should return an obj with 2 props', function () {
        expect( fibHelper.parseMetadata( 'type: button, click:callback' )).
          toEqual({ type:'button', click:'callback' })
      })
    })

    describe('Shorten Font Name Function', function() {
      var fontObject
      beforeEach( function() {
        fontObject = { font: { fontFamily: 'Gotham-Black' }}
      })

      it( 'should rename hyphenated gotham fonts', function() {
        fibHelper.shortenFont( fontObject )
        expect( fontObject.font.fontFamily ).toEqual( 'GothamBlack' )
      })

      it( 'should not rename hyphenated museo fonts', function() {
        fontObject.font.fontFamily = 'Museo-Slab'
        fibHelper.shortenFont( fontObject )
        expect( fontObject.font.fontFamily ).toEqual( 'Museo-Slab' )
      })
    })

    describe('Get Actual Size from Object tests', function() {
      var test_obj, test_rect_small, test_rect_big

      beforeEach(function() {
        test_obj = {
          left: 5,
          top: 10,
          width: 20,
          height: 30
        }

        test_rect = new RectanglePrimitive( test_obj )

        pixel_rect_small = {
          left: 6,
          top: 11,
          right: 24,
          bottom: 36
        }

        pixel_rect_big = {
          left: 4,
          top: 9,
          right: 26,
          bottom: 41
        }

        this.addMatchers({
          toBeSameSizeAs: function(sizeObj) {
            if (sizeObj.width !== this.actual.width ||
                sizeObj.height !== this.actual.height ||
                sizeObj.left !== this.actual.left ||
                sizeObj.top !== this.actual.top) {
              return false
            }

            return true
          }
        }); 
      })

      it('should extract same size if no pixelRect', function() {
        expect(fibHelper.getActualSize(test_rect)).toBeSameSizeAs(test_obj)
      })

      it('should extract same size if small pixel rect', function() {
        test_rect.pixelRect = pixel_rect_small
        expect(fibHelper.getActualSize(test_rect)).toBeSameSizeAs(test_obj)
      })

      it('should extract pixel rect size if big pixel rect', function() {
        test_rect.pixelRect = pixel_rect_big
        expect(fibHelper.getActualSize(test_rect)).toBeSameSizeAs({
          left: 4,
          top: 9,
          width: 22,
          height: 32
        })
      })

      it( 'should not use pixel rect size if no fill or brush', function() {
        test_rect.pixelRect = pixel_rect_big
        test_rect.pathAttributes.brush = null
        expect(fibHelper.getActualSize(test_rect)).toBeSameSizeAs(test_obj)
      })

      it( 'should use pixel rect size if fill', function() {
        test_rect.pixelRect = pixel_rect_big
        test_rect.pathAttributes.brush = null
        test_rect.pathAttributes.fill = {}
        expect(fibHelper.getActualSize(test_rect)).toBeSameSizeAs({
          left: 4,
          top: 9,
          width: 22,
          height: 32
        })
      })
    })
  })
})
