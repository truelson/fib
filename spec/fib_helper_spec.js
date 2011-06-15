/* File: fib.spec.js
 * Authors: Palmer Truelson
 * Company: Massive Health, LLC
 * Licence: $LICENSE
 * About: Fib unit tests 
 */
describe('Fib Helper Tests!', function () {

  beforeEach(function() {
    FibHelper = require( '../lib/fib_helper' ).FibHelper
    fw.selection = []
  })

  afterEach(function() {
    FibHelper.cleanup()
  })

  describe('Helper Function tests', function () {

    it('should have a working object type function', function () {
      expect(FibHelper.objectType([])).toEqual('Array')
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

      it('should call FwArray', function () {
        var oldFwArray = FwArray
        FwArray = createSpy()
        FibHelper.exportPNG( img, 'TestPlace' )
        expect(FwArray).toHaveBeenCalledWith( img )
        FwArray = oldFwArray
      })

      it('should maintain selection', function () {
        fw.selection = 'test'
        FibHelper.exportPNG(img, 'TestPlace')
        expect(fw.selection).toEqual('test')
      })

      it('should set exportOptions.exportFormat to PNG', function() {
        FibHelper.exportPNG(img, 'TestPlace')
        expect(FibHelper.sandboxDOM.exportOptions.exportFormat)
          .toEqual('PNG')
      })

      it('should set canvas size to full bounds', function() {
        spyOn(FibHelper, 'getActualSize').andReturn({
          left: 0, top:0, right: 20, bottom: 30
        })
        spyOn(fw._mockDOM, 'setDocumentCanvasSize')
        FibHelper.exportPNG(img, 'TestImage')
        expect(fw._mockDOM.setDocumentCanvasSize).toHaveBeenCalledWith({
          left: 0, top:0, right: 20, bottom: 30
        }, true)
      })
    })

    describe( 'Test extract meta data function', function () {
      it( 'should return an empty object when given an empty string',
        function () {
          expect( FibHelper.parseMetadata( '' )).toEqual({})
      })

      it( 'should return empty object if no colon anywhere', function () {
        expect( FibHelper.parseMetadata( 'asdf' )).toEqual({ id: 'asdf' })
      })

      it( 'should return an object with a button type', function () {
        expect( FibHelper.parseMetadata( 'type:button' ))
          .toEqual({ type:'button' })
      })
      it( 'should return an obj w button type even with space', function () {
        expect( FibHelper.parseMetadata( 'type : button ' )).
          toEqual({ type:'button' })
      })
      it( 'should return an obj with 2 props', function () {
        expect( FibHelper.parseMetadata( 'type: button, click:callback' )).
          toEqual({ type:'button', click:'callback' })
      })
    })

    describe('Shorten Font Name Function', function() {
      var fontObject
      beforeEach( function() {
        fontObject = { font: { fontFamily: 'Gotham-Black' }}
      })

      it( 'should rename hyphenated gotham fonts', function() {
        FibHelper.shortenFont( fontObject )
        expect( fontObject.font.fontFamily ).toEqual( 'GothamBlack' )
      })

      it( 'should not rename hyphenated museo fonts', function() {
        fontObject.font.fontFamily = 'Museo-Slab'
        FibHelper.shortenFont( fontObject )
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
        expect(FibHelper.getActualSize(test_rect)).toBeSameSizeAs(test_obj)
      })

      it('should extract same size if small pixel rect', function() {
        test_rect.pixelRect = pixel_rect_small
        expect(FibHelper.getActualSize(test_rect)).toBeSameSizeAs(test_obj)
      })

      it('should extract pixel rect size if big pixel rect', function() {
        test_rect.pixelRect = pixel_rect_big
        expect(FibHelper.getActualSize(test_rect)).toBeSameSizeAs({
          left: 4,
          top: 9,
          width: 22,
          height: 32
        })
      })

      it( 'should not use pixel rect size if no fill or brush', function() {
        test_rect.pixelRect = pixel_rect_big
        test_rect.pathAttributes.brush = null
        expect(FibHelper.getActualSize(test_rect)).toBeSameSizeAs(test_obj)
      })

      it( 'should use pixel rect size if fill', function() {
        test_rect.pixelRect = pixel_rect_big
        test_rect.pathAttributes.brush = null
        test_rect.pathAttributes.fill = {}
        expect(FibHelper.getActualSize(test_rect)).toBeSameSizeAs({
          left: 4,
          top: 9,
          width: 22,
          height: 32
        })
      })
    })
  })
})
