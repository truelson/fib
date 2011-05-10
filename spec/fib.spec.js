/* File: fib.spec.js
 * Authors: Palmer Truelson
 * Company: Massive Health, LLC
 * Licence: $LICENSE
 * About: Fib unit tests 
 */
describe('FIB Tests!', function () {

  var FIB, FibHelper;

  beforeEach(function() {
    FIB = require('../fib.jsf').FIB
    FibHelper = require('../fib_helper.js').FibHelper
    fw._resetMockDom(fw._mockDOM);
    fw.selection = [];
  });

  describe('Basic Fib Testing', function () {
    it('should have a FIB object', function () {
      expect(FIB).not.toEqual('undefined');
    });
  }); 

  describe('Name Creation tests', function () {

    var mockImage, mockImage2;

    beforeEach(function () {
      mockImage = new Image();
      mockImage2 = new Image();
      FibHelper.resetCounter();
    });
    afterEach(function () {
    });

    it('should extract an object', function () {
      expect(FIB._extractObjects([mockImage])[0]).
        not.toEqual(undefined);
    });
    it('should create a unique id if used id exists', function () {
      FibHelper.resetCounter();
      mockImage.name = 'holymackerel';
      mockImage2.name = 'holymackerel';
      expect(FIB._extractObjects(
        [mockImage, mockImage2])[1].id).not.toEqual('holymackerel');
    });

    it('should use name if exists without metaData', function () {
      mockImage.name = 'fdsa';
      expect(FIB._extractObjects([mockImage])[0].id)
        .toEqual('fdsa');
    });

    it('should use meta data id if there', function () {
      mockImage.name = 'type:image, id:asdf';
      expect(FIB._extractObjects([mockImage])[0].id)
        .toEqual('asdf');
    });

    it('should replace spaces with underscores', function () {
      mockImage.name = 'Control Town';
      expect(FIB._extractObjects([mockImage])[0].id)
        .toEqual('Control_Town');
    });

  });

  describe('Text object tests', function () {

    var mockText;

    beforeEach(function () {
      mockText = new Text();
      mockText.alignment = 'center';
      mockText.font = 'Helvetica';
      mockText.fontsize = 12;
      mockText.height = 40;
      mockText.left = 10;
      mockText.name = 'MyLabel';
      mockText.textChars = 'Please Work';
      mockText.top = 0;
      mockText.width = 200;
    });

    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should parse a text object as a label', function () {
      expect(FIB._extractObjects([mockText])).toEqual([
        {
          textAlign: 'center', 
          color: '#ff0000',
          font: {
            fontFamily: 'Helvetica',
            fontSize: 12
          },
          height: 40,
          left: 10,
          type:'label',
          id: 'MyLabel',
          text: 'Please Work',
          top: 0,
          width: 200
        }
      ]);
    });
  });

  describe('Test the full exportObjects function', function () {
    var t1, t2, t3;
    var t1Out, t2Out, t3Out;
    var objs;

    beforeEach(function() {
      t1 = new Text({name: 't1'});
      t1Out = {
        color: '#ff0000',
        font: {
          fontFamily: '',
          fontSize: 0
        },
        height: 0,
        left: 0,
        type:'label',
        id: 't1',
        text: '',
        textAlign: 'left', 
        top: 0,
        width: 0
      };

      t2 = new Text({name: 't2'});
      t2Out = {
        color: '#ff0000',
        font: {
          fontFamily: '',
          fontSize: 0
        },
        height: 0,
        left: 0,
        type:'label',
        id: 't2',
        text: '',
        textAlign: 'left', 
        top: 0,
        width: 0
      };
      t3 = new Text({name: 't3'});
      t3Out = {
        color: '#ff0000',
        font: {
          fontFamily: '',
          fontSize: 0
        },
        height: 0,
        left: 0,
        type:'label',
        id: 't3',
        text: '',
        textAlign: 'left', 
        top: 0,
        width: 0
      };
      objs = FIB._extractObjects([t1, t2, t3]);
    });

    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should have label t1', function () {
      expect(objs[0]).toEqual(t1Out);
    });
    it('should have label t2', function () {
      expect(objs[1]).toEqual(t2Out);
    });
    it('should have label t3', function () {
      expect(objs[2]).toEqual(t3Out);
    });
  });

  describe('Test text with null name', function () {
    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should use text for name if name is null', function () {
      var testText = new Text({name: null, textChars: 'Text Name'});
      var obj = FIB._extractObjects([testText]);
      expect(obj[0].id).toEqual('__TestViewText1');
    });
  });

  describe('Image tests', function () {
    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should create an image ImageView object', function () {
      var testImg = new Image({name: 'img'});
      var obj = FIB._extractObjects([testImg]);
      expect(obj[0].type).toEqual('image');
    });

    it('should create an instance ImageView object', function () {
      var testInst = new Instance({name: 'inst'});
      var obj = FIB._extractObjects([testInst]);
      expect(obj[0].type).toEqual('image');
    });

    it('should create a group ImageView object', function () {
      var test = new Group({name: 'grp'});
      obj = FIB._extractObjects([test]);
      expect(obj[0].type).toEqual('image');
    });

    it('should create a RectanglePrimitive ImageView object', function () {
      var test = new RectanglePrimitive({name: 'rect'});
      obj = FIB._extractObjects([test]);
      expect(obj[0].type).toEqual('image');
    });

  });

  describe('Test exporting button parameters', function () {

    beforeEach(function () {
     FibHelper.getResourceDirs(); 
    });

    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should create a button object from a group', function () {
      var test = new Group({name: 'type:button'});
      obj = FIB._extractObjects([test]);
      expect(obj[0].type).toEqual('button');
    });

    it('should create a button object image from a group', function () {
      var test = new Group({name: 'id:heya,type:button'});
      obj = FIB._extractObjects([test]);
      expect(obj[0].backgroundImage).toEqual(
        'images/TestView/heya.png');
    });

    it('should not create a button object if misspelled', function () {
      var test = new Group({name: 'type:btton'});
      obj = FIB._extractObjects([test]);
      expect(obj[0].type).toEqual('btton');
    });

    it('should export a button with a disabled background', function() {
      var test = new Group({name: 'id:heya,type:button, inactive:test'});
      obj = FIB._extractObjects([test]);
      expect(obj[0].backgroundDisabledImage).toEqual(
        'images/TestView/test.png');
    });
  });

    describe('Test exporting different type objects', function () {

    beforeEach(function () {
      FibHelper.getResourceDirs(); 
    });

    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should create an image from a group with unknown type', function() {
      var test = new Group({name: 'id:hehe'});
      obj = FIB._extractObjects([test]);
      expect(obj[0].type).toEqual('image');
    });

    it('should export a free image', function() {
      var test = new Instance({name: 'id:tehe, type:free_image'});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual(undefined);
    });

    it('should create a textfield from text', function() {
      var test = new Text({name: 'id:textytext, type:textfield',
        font: 'Museo-Bold', fontsize: 24});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 0,
        top: 0,
        width: 0,
        color: '#ff0000',
        id: 'textytext',
        font: { fontFamily: 'Museo-Bold', fontSize: 24 },
        type: 'textfield',
        textAlign: 'left',
        value: ''
      });
    });

    it('should create a textfield from text with hacked fonts', function() {
      var test = new Text({name: 'id:textytext, type:textfield',
        font: 'Gotham-Bold', fontsize: 24});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 0,
        top: 0,
        width: 0,
        color: '#ff0000',
        id: 'textytext',
        font: { fontFamily: 'GothamBold', fontSize: 24 },
        type: 'textfield',
        textAlign: 'left',
        value: ''
      });
    });

    it('should create a textfield from a group', function() {
      var test = new Group({name: 'id:nummy, type:textfield'});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        id: 'nummy',
        backgroundColor: 'transparent',
        type: 'textfield'
      });
    });
    
    it('should export textfield colors and fonts', function() {
      var test = new Group({name: 'id:nummy, type:textfield,color:#666666,font:Museo-Bold,fontsize:27'});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        id: 'nummy',
        backgroundColor: 'transparent',
        font: {fontFamily:'Museo-Bold', fontSize: '27'},
        type: 'textfield',
        color: '#666666'
      });
    });

    it('should export textfield hacked fonts properly', function() {
      var test = new Group({name: 'id:nummy, type:textfield,color:#666666,font:Gotham-Bold-Italic,fontsize:27'});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        id: 'nummy',
        backgroundColor: 'transparent',
        font: {fontFamily:'GothamBoldItalic', fontSize: '27'},
        color: '#666666',
        type: 'textfield'
      });
    });

    it('should create a textarea from a group', function() {
      var test = new Group({name: 'id:nummy, type:textarea'});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        id: 'nummy',
        backgroundColor: 'transparent',
        type: 'textarea'
      });
    });
    
    it('should create a switch from a group', function() {
      var test = new Group({name: 'id:nummy,type:switch,value:false'});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        left: 0,
        top: 0,
        height: 0,
        width: 0,
        id: 'nummy',
        type: 'switch',
        value: false
      })
    })

    it('should create a numbox from a group', function() {
      var test = new Group(
        {name: 'id:nummy, type:textfield, keypad:num'});
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        id: 'nummy',
        backgroundColor: 'transparent',
        type: 'textfield',
        keypad: 'num'
      });
    });

    it('should create a textbox image from a group', function() {
      var test = new Group({name: 'id:nummy, type:textfield'});
      obj = FIB._extractObjects([test]);
      expect(obj[1]).toEqual({
        height: 0,
        left: 0,
        top: 0,
        width: 0,
        image: 'images/TestView/nummy_img.png',
        id: 'nummy_img',
        type: 'image'
      });
    });

    it('should create a textarea image from a group', function() {
      var test = new Group({name: 'id:nummy, type:textarea'});
      obj = FIB._extractObjects([test]);
      expect(obj[1]).toEqual({
        height: 0,
        left: 0,
        top: 0,
        width: 0,
        image: 'images/TestView/nummy_img.png',
        id: 'nummy_img',
        type: 'image'
      });
    });

    it('should create a textbox from a group with background', function() {
      var test = new Group({
        name: 'id:nummy, type:textfield', 
        pathAttributes: {
          fillColor: '#ffffff'
        }
      });

      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        id: 'nummy',
        type: 'textfield',
        backgroundColor: 'transparent'
      });
    });

    it('should create a table view object', function () {
      var test = new RectanglePrimitive({
        name: 'id:tab, type:table',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
          top: 0,
          left: 0,
          type: 'table',
          id: 'tab',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200,
          backgroundImage: 'images/TestView/tab.png'
      });
    });

    it('should create a table view object without img', function () {
      var test = new RectanglePrimitive({
        name: 'id:tab, type:table',
        opacity: 0,
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
          top: 0,
          left: 0,
          type: 'table',
          id: 'tab',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200
      });
    });

    it('should create a scrollable view object', function () {
      var test = new RectanglePrimitive({
        name: 'id:scr, type:scrollable',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
          top: 0,
          left: 0,
          type: 'scrollable',
          id: 'scr',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200,
          backgroundImage: 'images/TestView/scr.png'
      });
    });

    it('should create a scrollable view object without img', function () {
      var test = new RectanglePrimitive({
        name: 'id:scr, type:scrollable',
        opacity: 0,
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
          top: 0,
          left: 0,
          type: 'scrollable',
          id: 'scr',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200
      });
    });

    it('should create a scroll view object', function () {
      var test = new RectanglePrimitive({
        name: 'id:scr, type:scroll',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
          left: 0,
          top: 0,
          type: 'scroll',
          id: 'scroll_view',
          height: 100,
          width: 200
      });
    });

    it('should create a web view object', function () {
      var test = new RectanglePrimitive({
        name: 'id:webby, type:web, url:testurl.html',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj[0]).toEqual({
          left: 0,
          top: 0,
          type: 'web', 
          url:'testurl.html',
          id: 'webby',
          height: 100,
          width: 200
      });
    });
  });

  describe('Test extract meta data function', function () {
    it('should return empty object when given an empty string', function () {
      expect(FIB._parseMetadata('')).toEqual({});
    });

    it('should return empty object if no colon anywhere', function () {
      expect(FIB._parseMetadata('asdf')).toEqual({id: 'asdf'});
    });

    it('should return an object with a button type', function () {
      expect(FIB._parseMetadata('type:button')).toEqual({type:'button'});
    });
    it('should return an obj w button type even with space', function () {
      expect(FIB._parseMetadata('type : button ')).
        toEqual({type:'button'});
    });
    it('should return an obj with 2 props', function () {
      expect(FIB._parseMetadata('type: button, click:callback')).
        toEqual({type:'button', click:'callback'});
    });
  });

  describe('Test the full export function', function () {
    
    var files;
    var cSpy, oSpy, wSpy, clSpy, utf8Spy;
    
    describe('Simple full export test', function () {
      beforeEach(function () {
        cSpy = spyOn(Files, 'createFile');
        oSpy = spyOn(Files, 'open').andCallThrough();
        utf8Spy = spyOn(fw._mockFile, 'writeUTF8');
        wSpy = spyOn(fw._mockFile, 'write');
        clSpy = spyOn(fw._mockFile, 'close');
        fw._mockDOM.topLayers = [new Text({name: 'BigTest'})];
        FIB.exportInterface();
      });

      afterEach(function () {
        FibHelper.resetCounter();
      });

      it('should export a label and write the json to file', function () {
        // might want to change this test and serialize an object here
        // as well.  Editing this string ain't fun
        expect(utf8Spy).toHaveBeenCalledWith(
          dojo.toJson([
            {
              "left": 0,
              "top": 0,
              "height": 0,
              "width": 0,
              "id":"BigTest",
              "textAlign":"left",
              "color":"#ff0000",
              "font":{"fontFamily":"","fontSize":0},
              "type":"label",
              "text":""
            }
          ], true, '  '));
      });

      it('should never call the write command', function () {
        expect(wSpy).not.toHaveBeenCalled();
      });

      it('should open a file in the mock Test View Directory', function () {
        expect(cSpy).toHaveBeenCalledWith('~/TestDir/json/TestView.json',
          'json', 'FWMX');
      });
    });
  });
});
