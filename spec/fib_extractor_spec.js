describe( 'Fib Export Object Tests!', function () {

  beforeEach( function() {
    FibExtractor = require( '../lib/fib_extractor' ).FibExtractor
    FibHelper = require( '../lib/fib_helper' ).FibHelper
    fw.selection = []
  })

  afterEach( function() {
    FibHelper.resetCounter()
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

    it( 'should export only an image file if a free_image', function() {
      testRectangle.name = 'id: testObject, type: free_image'
      spyOn( FibHelper, 'exportPNG' )
      expect( FibExtractor.extract( testRectangle )).toEqual( null )
      expect( FibHelper.exportPNG ).toHaveBeenCalledWith( testRectangle,
        'testObject' )
    })

    it( 'should export a button', function() {
      testRectangle.name = 'id: testObject, type: button'
      expect( FibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        width: 20,
        height: 30,
        backgroundImage: 'images/TestView/testObject.png',
        left: 40,
        top: 50,
        type: 'button'
      })
    })

    it( 'should export a textfield', function() {
      testRectangle.name = 'id: testObject, type: textfield'
      expect( FibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        backgroundColor: 'transparent',
        width: 20,
        height: 30,
        left: 40,
        top: 50,
        type: 'textfield'
      })
    })

    it( 'should export a textarea', function() {
      testRectangle.name = 'id: testObject, type: textarea'
      expect( FibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        backgroundColor: 'transparent',
        width: 20,
        height: 30,
        left: 40,
        top: 50,
        type: 'textarea'
      })
    })

    it( 'should export a switch', function() {
      testRectangle.name = 'id: testObject, type: switch'
      expect( FibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        value: false,
        width: 20,
        height: 30,
        left: 40,
        top: 50,
        type: 'switch'
      })
    })
  })


  describe( 'ExtractVectorAsImage Function', function() {
    var testPath

    beforeEach( function() {
      testPath = new Path({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract this as a vector', function() {
      expect( FibExtractor.extractVectorAsImage( testPath ))
        .toEqual( false )
    })

    it( 'should extract this as an image due to contours ', function() {
      testPath.contours.push( {} )
      testPath.contours.push( {} )
      expect( FibExtractor.extractVectorAsImage( testPath ))
        .toEqual( true )
    })

    it( 'should extract this as an image due to fill name', function() {
      testPath.pathAttributes.fill = {}
      testPath.pathAttributes.fill.name = 'stripe'
      expect( FibExtractor.extractVectorAsImage( testPath ))
        .toEqual( true )
    })

    it( 'should extract this as an image due to fill ', function() {
      testPath.pathAttributes.fill = {}
      testPath.pathAttributes.fill.name = 'Solid'
      testPath.pathAttributes.fill.textureBlend = 1
      expect( FibExtractor.extractVectorAsImage( testPath ))
        .toEqual( true )
    })
  })

  describe( 'Extract Path Function', function() {
    var testPath

    beforeEach( function() {
      testPath = new Path({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should export a simple rectangle from a path', function() {
      testPath.name = 'type: view'
      expect( FibExtractor.extract( testPath ))
        .toEqual({
          id: '__TestViewPath1',
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

    it( 'should export a canvas view', function() {
      expect( FibExtractor.extract( testPath ))
        .toEqual({
          id: '__TestViewPath1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'canvas',
          drawList: [ ]
        })
    })
  })
})
