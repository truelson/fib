describe( 'Fib Extract Object Tests!', function () {

  var fibExtractor, fibHelper

  beforeEach( function() {
    var FibHelper = require( '../lib/fib_helper' ).FibHelper
    var FibExtractor = require( '../lib/fib_extractor' ).FibExtractor

    fibHelper = FibHelper
      .createFibHelper( fw.createDocument(), '~/TestDir/' )

    fibExtractor = FibExtractor.createFibExtractor( fibHelper )

    fw.selection = []
  })

  afterEach( function() {
  })

  describe( 'Name Creation tests', function () {

    var mockImage, mockImage2

    beforeEach( function () {
      mockImage = new Image()
      mockImage2 = new Image()
    })

    it( 'should extract an object', function () {
      expect( fibExtractor.extractObjects([ mockImage ])[0]).
        not.toEqual( undefined )
    })

    it( 'should use unique name if exists without metaData', function () {
      mockImage.name = 'fdsa'
      expect( fibExtractor.extractObjects([ mockImage ])[0].id )
        .toEqual( '__TestViewImage1' )
    })

    it( 'should use meta data id if there', function () {
      mockImage.name = 'type:image, id:asdf'
      expect( fibExtractor.extractObjects([ mockImage ])[0].id )
        .toEqual( 'asdf' )
    })

    it( 'should not extract degenerate IDs', function () {
      mockImage.name = 'type:image, id:asdf'
      mockImage2.name = 'type:image, id:asdf'

      var objects = fibExtractor.extractObjects([ mockImage, mockImage2 ])
      expect( objects[0].id ).toEqual( '__TestViewImage1' )
    })

    it( 'should contract spaces', function () {
      mockImage.name = 'id:Control Town'
      expect( fibExtractor.extractObjects([ mockImage ])[0].id )
        .toEqual( 'ControlTown' )
    })
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
      expect( fibExtractor.extractBasic( testObject ))
        .toEqual({
          id: 't',
          type: 'view',
          opacity: 1,
          width: 20,
          height: 30,
          left: 40,
          top: 50
        })
    })
    
    it( 'should extract the basics of an object with parent', function() {
      expect( fibExtractor.extractBasic( testObject, parent ))
        .toEqual({
          id: 't',
          type: 'view',
          opacity: 1,
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

    it( 'should extract a rectangle primitive type as view', function() {
      expect( fibExtractor.extract( testRectangle ))
        .toEqual({
          id: '__TestViewRectanglePrimitive1',
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'view',
          opacity: 1,
          borderWidth: 1,
          borderColor: '#00ff00',
          borderRadius: 0,
          backgroundColor: '#ff0000'
        })
    })

    it( 'should extract a view rectangle when given no type', function() {
      testRectangle.name = 'id: testObject'
      expect( fibExtractor.extract( testRectangle ))
        .toEqual({
          id: 'testObject',
          opacity: 1,
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'view',
          borderWidth: 1,
          borderColor: '#00ff00',
          borderRadius: 0,
          backgroundColor: '#ff0000'
        })
    })

    it( 'should extract a rectangle primitive with opacity 0', function() {
      testRectangle.name = 'id: testObject'
      testRectangle.opacity = 0
      expect( fibExtractor.extract( testRectangle ))
        .toEqual({
          id: 'testObject',
          opacity: 0,
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'view',
          borderWidth: 1,
          borderColor: '#00ff00',
          borderRadius: 0,
          backgroundColor: '#ff0000'
        })
    })

    it( 'should extract a rectangle told that it is an image', function() {
      testRectangle.name = 'id: testObject, type: image'
      expect( fibExtractor.extract( testRectangle ))
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

    it( 'should extract a rectangle with an inactive image', function() {
      testRectangle.name = 'id: testObject, type: image, inactive: funk'
      expect( fibExtractor.extract( testRectangle ))
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

    it( 'should extract only an image file if a free_image', function() {
      testRectangle.name = 'id: testObject, type: free_image'
      spyOn( fibHelper, 'exportPNG' )
      expect( fibExtractor.extract( testRectangle )).toEqual( null )
      expect( fibHelper.exportPNG ).toHaveBeenCalledWith( testRectangle,
        'testObject' )
    })

    it( 'should extract a button', function() {
      testRectangle.name = 'id: testObject, type: button'
      expect( fibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        width: 20,
        height: 30,
        backgroundImage: 'images/TestView/testObject.png',
        left: 40,
        top: 50,
        type: 'button'
      })
    })

    it( 'should extract a textfield with font and size', function() {
      testRectangle.name =
        'id: testObject, type: textfield, font: Museo, fontsize: 22'
      expect( fibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        opacity: 1,
        backgroundColor: 'transparent',
        width: 20,
        height: 30,
        left: 40,
        top: 50,
        font: {
          fontFamily: 'Museo',
          fontSize: '22'
        },
        type: 'textfield'
      })
    })

    it( 'should extract a textarea', function() {
      testRectangle.name = 'id: testObject, type: textarea'
      expect( fibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        opacity: 1,
        backgroundColor: 'transparent',
        width: 20,
        height: 30,
        left: 40,
        top: 50,
        type: 'textarea'
      })
    })

    it( 'should extract a switch', function() {
      testRectangle.name = 'id: testObject, type: switch'
      expect( fibExtractor.extract( testRectangle )).toEqual({
        id: 'testObject',
        value: false,
        opacity: 1,
        width: 20,
        height: 30,
        left: 40,
        top: 50,
        type: 'switch'
      })
    })
  })

  describe( 'Test text with null name', function () {

    it( 'should use text for name if name is null', function () {
      var testText = new Text({ name: null, textChars: 'Text Name' })
      var obj = fibExtractor.extractObjects([ testText ])
      expect( obj[0].id ).toEqual( '__TestViewText1' )
    })
  })

  describe( 'Extract Image Function', function() {
    var testImage

    beforeEach( function() {
      testImage = new Image({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract an image as an image', function() {
      expect( fibExtractor.extract( testImage ))
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
      expect( fibExtractor.extract( testImage ))
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
      expect( fibExtractor.extract( testImage ))
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
      expect( fibExtractor.extract( testLayer )[1].id).toEqual('Text1')
    })

    it( 'should see second label of two labels', function() {
      expect( fibExtractor.extract( testLayer )[0].id).toEqual('Text2')
    })

    it( 'should not extract web layer', function() {
      testLayer.layerType = 'web'
      expect( fibExtractor.extract( testLayer )).toEqual([])
    })

    it( 'should not have a null from a free image', function() {
      testLayer.elems.push( new Group({ name: 'type:free_image' }))
      expect( fibExtractor.extract( testLayer ).length ).toEqual( 2 )
    })
  })

  describe( 'Extract Group Function', function() {
    var testGroup

    beforeEach( function() {
      testGroup = new Group({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract a group as a view', function() {
      expect( fibExtractor.extract( testGroup ))
        .toEqual({
          id: '__TestViewGroup1',
          opacity: 1,
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

      var newGroup = fibExtractor.extract( testGroup )
      expect( newGroup.children[0].top ).toEqual( 10 )
      expect( newGroup.children[0].left ).toEqual( 30 )
    })

    it( 'should extract a group as a view with children', function() {
      testGroup.elements = []
      testGroup.elements.push( new Text({ name: 'id: woohoo' }))
      testGroup.elements.push( new Text({ name: 'id: woohoo2' }))

      var newGroup = fibExtractor.extract( testGroup )
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
      expect( fibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          opacity: 1,
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
      expect( fibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          opacity: 1,
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
      expect( fibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          opacity: 1,
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
      expect( fibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          opacity: 1,
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
      expect( fibExtractor.extract( testText ))
        .toEqual({
          id: '__TestViewText1',
          opacity: 1,
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
      expect( fibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( false )
    })

    it( 'should extract this as an image due to contours ', function() {
      testPath.contours.push( {} )
      testPath.contours.push( {} )
      expect( fibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( true )
    })

    it( 'should extract this as an image due to fill name', function() {
      testPath.pathAttributes.fill = {}
      testPath.pathAttributes.fill.name = 'stripe'
      expect( fibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( true )
    })

    it( 'should extract this as an image due to fill ', function() {
      testPath.pathAttributes.fill = {}
      testPath.pathAttributes.fill.name = 'Solid'
      testPath.pathAttributes.fill.textureBlend = 1
      expect( fibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( true )
    })

    it( 'should not extract this as an image due to fill ', function() {
      testPath.pathAttributes.fill = {}
      testPath.pathAttributes.fill.name = 'fc_Normal'
      testPath.pathAttributes.fill.shape = 'Solid'
      expect( fibExtractor.shouldExtractVectorAsImage( testPath ))
        .toEqual( false )
    })
  })

  describe( 'Extract Path Function', function() {
    var testPath

    beforeEach( function() {
      testPath = new Path({ width: 20, height: 30, left: 40, top: 50 })
    })

    it( 'should extract a simple rectangle from a path', function() {
      testPath.name = 'type: view'
      expect( fibExtractor.extract( testPath ))
        .toEqual({
          id: '__TestViewPath1',
          opacity: 1,
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'view',
          borderWidth: 1,
          borderColor: '#00ff00',
          borderRadius: 0
        })
    })

    it( 'should extract a canvas view', function() {
      expect( fibExtractor.extract( testPath ))
        .toEqual({
          id: '__TestViewPath1',
          opacity: 1,
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'canvas',
          drawList: [ ]
        })
    })

    it( 'should extract an image', function() {
      testPath.name = 'type: canvas'
      testPath.contours = [1, 1]
      expect( fibExtractor.extract( testPath ))
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

    it( 'should extract a canvas view with drawList', function() {
      testPath.contours = [{
        isClosed: true,
        nodes: [
          { x: 1, y: 2, predX: 3, predY: 4, succX: 5, succY: 6 },
          { x: 7, y: 8, predX: 9, predY: 10, succX: 11, succY: 12 },
          { x: 0, y: 1, predX: 2, predY: 3, succX: 4, succY: 5 }
        ]
      }]
      expect( fibExtractor.extract( testPath ))
        .toEqual({
          id: '__TestViewPath1',
          opacity: 1,
          width: 20,
          height: 30,
          left: 40,
          top: 50,
          type: 'canvas',
          drawList: [{
            type: 'curve',
            x: 0,
            y: 0,
            color: '#00ff00',
            close: true,
            lineWidth: 1,
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


  describe( 'Test the full extractObjects function', function () {
    var t1, t2, t3
    var t1Out, t2Out, t3Out
    var objs

    beforeEach( function() {
      t1 = new Text({ name: 'id:t1' })
      t1Out = {
        color: '#ff0000',
        font: {
          fontFamily: '',
          fontSize: 0
        },
        opacity: 1,
        height: 0,
        left: 0,
        type:'label',
        id: 't1',
        text: '',
        textAlign: 'left',
        top: 0,
        width: 0
      }

      t2 = new Text({ name: 'id:t2' })
      t2Out = {
        color: '#ff0000',
        font: {
          fontFamily: '',
          fontSize: 0
        },
        opacity: 1,
        height: 0,
        left: 0,
        type:'label',
        id: 't2',
        text: '',
        textAlign: 'left',
        top: 0,
        width: 0
      }
      t3 = new Text({ name: 'id:t3' })
      t3Out = {
        color: '#ff0000',
        font: {
          fontFamily: '',
          fontSize: 0
        },
        opacity: 1,
        height: 0,
        left: 0,
        type:'label',
        id: 't3',
        text: '',
        textAlign: 'left',
        top: 0,
        width: 0
      }
      objs = fibExtractor.extractObjects([ t1, t2, t3 ])
    })

    it( 'should have label t1', function () {
      expect( objs[2] ).toEqual( t1Out )
    })
    it( 'should have label t2', function () {
      expect( objs[1] ).toEqual( t2Out )
    })
    it( 'should have label t3', function () {
      expect( objs[0] ).toEqual( t3Out )
    })
  })
})
