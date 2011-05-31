describe( 'Fib Export Object Tests!', function () {

  beforeEach( function() {
    FibExtractor = require( '../lib/fib_extractor' ).FibExtractor
    FibHelper = require( '../lib/fib_helper' ).FibHelper
    fw.selection = []
  })

  afterEach( function() {
    FibHelper.cleanup()
  })

  describe( 'Extract Basic Function', function() {

    var testObject, parent

    beforeEach( function() {
      testObject = new RectanglePrimitive(
        { name:'id:t, type:view', width: 20, height: 30, left: 40, top: 50 })
      parent = new RectanglePrimitive(
        { name:'type:view', width: 200, height: 300, left: 400, top: 500 })
    })

    it( 'should extract the basics of a simple object', function() {
      expect( FibExtractor.extractBasic( testObject ))
        .toEqual({
          id: 't',
          type: 'view',
          width: 20,
          height: 30,
          left: 40,
          top: 50
        })
    })
    
    it( 'should extract the basics of an object with parent', function() {
      expect( FibExtractor.extractBasic( testObject, parent ))
        .toEqual({
          id: 't',
          type: 'view',
          width: 20,
          height: 30,
          left: -360,
          top: -450
        })
    })
  })

  describe( 'Extract RectanglePrimitive Function', function() {

    var testRectangle

    beforeEach( function() {
      testRectangle = new RectanglePrimitive(
        { name:'type:view', width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should export a rectangle primitive type as view', function() {
      expect( FibExtractor.extract( testRectangle ))
        .toEqual({
          id: '__TestViewRectanglePrimitive1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'view',
          background: '#ff0000',
          borderWidth: 1,
          borderColor: '#00ff00'
        })
    })

    it( 'should export a canvas rectangle when given no type', function() {
      testRectangle.name = 'id: testObject'
      expect( FibExtractor.extract( testRectangle ))
        .toEqual({
          id: 'testObject',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'canvas',
          drawList: [{
            type: 'rect',
            background: '#ff0000',
            color: '#00ff00',
            lineWidth: 1,
            x: 0,
            y: 0,
            width: 20,
            height: 30
          }]
        })
    })

    it( 'should export a rectangle told that it is an image', function() {
      testRectangle.name = 'id: testObject, type: image'
      expect( FibExtractor.extract( testRectangle ))
        .toEqual({
          id: 'testObject',
          width: 20,
          height: 30,
          image: 'images/TestView/testObject.png',
          left: 40,
          top: 50,
          type: 'image'
        })
    })

    it( 'should export a rectangle with an inactive image', function() {
      testRectangle.name = 'id: testObject, type: image, inactive: funk'
      expect( FibExtractor.extract( testRectangle ))
        .toEqual({
          backgroundDisabledImage: 'images/TestView/funk.png',
          id: 'testObject',
          width: 20,
          height: 30,
          image: 'images/TestView/testObject.png',
          left: 40,
          top: 50,
          type: 'image',
        })
    })

    it( 'should export an image if rectangle is a free_image', function() {
      testRectangle.name = 'id: testObject, type: free_image'
      spyOn( FibHelper, 'exportPNG' )
      expect( FibExtractor.extract( testRectangle )).toEqual( null )
      expect( FibHelper.exportPNG ).toHaveBeenCalledWith( testRectangle,
        'testObject' )
    })
  })
})
