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

  describe( 'Extract Image Function', function() {
    var testImage

    beforeEach( function() {
      testImage = new Image({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract an image as an image', function() {
      expect( FibExtractor.extract( testImage ))
        .toEqual({
          id: '__TestViewImage1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'image',
          image: 'images/TestView/__TestViewImage1.png'
        })
    })

    it( 'should extract an image as an image even if canvas', function() {
      testImage.name = 'type: canvas'
      expect( FibExtractor.extract( testImage ))
        .toEqual({
          id: '__TestViewImage1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'image',
          image: 'images/TestView/__TestViewImage1.png'
        })
    })
  })

  describe( 'Extract Instance Function', function() {
    var testImage

    beforeEach( function() {
      testImage = new Instance({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract an instance as an image', function() {
      expect( FibExtractor.extract( testImage ))
        .toEqual({
          id: '__TestViewInstance1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'image',
          image: 'images/TestView/__TestViewInstance1.png'
        })
    })
  })

  describe( 'Extract Layer Function', function() {
    var testLayer

    beforeEach( function() {
      testLayer = new Layer()
      testLayer.elems.push( new Text({ name: 'id:Text1' }))
      testLayer.elems.push( new Text({ name: 'id:Text2' }))
    })

    it( 'should see first label of two labels', function() {
      expect( FibExtractor.extract( testLayer )[1].id).toEqual('Text1')
    })

    it( 'should see second label of two labels', function() {
      expect( FibExtractor.extract( testLayer )[0].id).toEqual('Text2')
    })

    it( 'should not export web layer', function() {
      testLayer.layerType = 'web'
      expect( FibExtractor.extract( testLayer )).toEqual([])
    })

    it( 'should not have a null from a free image', function() {
      testLayer.elems.push( new Group({ name: 'type:free_image' }))
      expect( FibExtractor.extract( testLayer ).length ).toEqual( 2 )
    })
  })

  describe( 'Extract Group Function', function() {
    var testGroup

    beforeEach( function() {
      testGroup = new Group({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract a group as a view', function() {
      expect( FibExtractor.extract( testGroup ))
        .toEqual({
          id: '__TestViewGroup1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'view',
          children: []
        })
    })

    it( 'should extract a group as a view with child offset', function() {
      testGroup.top = 20
      testGroup.left = 10
      testGroup.elements = []
      testGroup.elements.push( new Text({ top: 30, left: 40 }))

      var newGroup = FibExtractor.extract( testGroup )
      expect( newGroup.children[0].top ).toEqual( 10 )
      expect( newGroup.children[0].left ).toEqual( 30 )
    })

    it( 'should extract a group as a view with children', function() {
      testGroup.elements = []
      testGroup.elements.push( new Text({ name: 'id: woohoo' }))
      testGroup.elements.push( new Text({ name: 'id: woohoo2' }))

      var newGroup = FibExtractor.extract( testGroup )
      expect( newGroup.children[1].id ).toEqual( 'woohoo' )
      expect( newGroup.children[0].id ).toEqual( 'woohoo2' )
    })

  })

  describe( 'Extract Text Function', function() {
    var testText

    beforeEach( function() {
      testText = new Text({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract text as a label', function() {
      expect( FibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'label',
          color: '#ff0000',
          font: {
            fontFamily: '',
            fontSize: 0
          },
          textAlign: 'left',
          text: ''
        })
    })

    it( 'should extract text as a label with shortened font', function() {
      testText.font = 'Gotham-Black'
      expect( FibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'label',
          color: '#ff0000',
          font: {
            fontFamily: 'GothamBlack',
            fontSize: 0
          },
          textAlign: 'left',
          text: ''
        })
    })

    it( 'should extract text as a textfield', function() {
      testText.name = 'type: textfield'
      expect( FibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'textfield',
          color: '#ff0000',
          backgroundColor: 'transparent',
          font: {
            fontFamily: '',
            fontSize: 0
          },
          textAlign: 'left',
          value: ''
        })
    })

    it( 'should extract text as a textfield with short font', function() {
      testText.name = 'type: textfield'
      testText.font = 'Gotham-Black'
      expect( FibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'textfield',
          color: '#ff0000',
          backgroundColor: 'transparent',
          font: {
            fontFamily: 'GothamBlack',
            fontSize: 0
          },
          textAlign: 'left',
          value: ''
        })
    })

    it( 'should extract text as a textarea', function() {
      testText.name = 'type: textarea'
      expect( FibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'textarea',
          color: '#ff0000',
          backgroundColor: 'transparent',
          font: {
            fontFamily: '',
            fontSize: 0
          },
          textAlign: 'left',
          value: ''
        })
    })
  })

  describe( 'ExtractVectorAsImage Function', function() {
    var testPath

    beforeEach( function() {
      testPath = new Path({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract this as a vector', function() {
      expect( FibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( false )
    })

    it( 'should extract this as an image due to contours ', function() {
      testPath.contours.push( {} )
      testPath.contours.push( {} )
      expect( FibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( true )
    })

    it( 'should extract this as an image due to fill name', function() {
      testPath.pathAttributes.fill = {}
      testPath.pathAttributes.fill.name = 'stripe'
      expect( FibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( true )
    })

    it( 'should extract this as an image due to fill ', function() {
      testPath.pathAttributes.fill = {}
      testPath.pathAttributes.fill.name = 'Solid'
      testPath.pathAttributes.fill.textureBlend = 1
      expect( FibExtractor.shouldExtractVectorAsImage( testPath ))
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

    it( 'should export an image', function() {
      testPath.name = 'type: canvas'
      testPath.contours = [1, 1]
      expect( FibExtractor.extract( testPath ))
        .toEqual({
          id: '__TestViewPath1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'image',
          image: 'images/TestView/__TestViewPath1.png'
        })
    })

    it( 'should export a canvas view with drawList', function() {
      testPath.contours = [{
        isClosed: true,
        nodes: [
          { x: 1, y: 2, predX: 3, predY: 4, succX: 5, succY: 6 },
          { x: 7, y: 8, predX: 9, predY: 10, succX: 11, succY: 12 },
          { x: 0, y: 1, predX: 2, predY: 3, succX: 4, succY: 5 }
        ]
      }]
      expect( FibExtractor.extract( testPath ))
        .toEqual({
          id: '__TestViewPath1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'canvas',
          drawList: [{
            type: 'curve',
            color: '#00ff00',
            close: true,
            linewidth: 1,
            points: [{
              x: -39, y: -48,
              predX: -37, predY: -46,
              succX: -35, succY: -44
            }, {
              x : -33, y : -42,
              predX : -31, predY : -40,
              succX : -29, succY : -38
            }, {
              x : -40, y : -49,
              predX : -38, predY : -47,
              succX : -36, succY : -45 }]
          }]
        })
    })
  })
})
