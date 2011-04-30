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

    it('should create a name if there is no name', function () {
      expect(FIB._extractObjects([mockImage])['__TestViewImage1']).
        not.toEqual(undefined);
    });

    it('should create a unique name if used name exists', function () {
      FibHelper.resetCounter();
      mockImage.name = 'holymackerel';
      mockImage2.name = 'holymackerel';
      expect(FIB._extractObjects(
        [mockImage, mockImage2])['__TestViewImage1']).not.toEqual(undefined);
    });

    it('should use name if exists but not metaData', function () {
      mockImage.name = 'fdsa';
      expect(FIB._extractObjects([mockImage])['fdsa']).
        not.toEqual(undefined);
    });

    it('should use meta data name if there', function () {
      mockImage.name = 'type:image, name:asdf';
      expect(FIB._extractObjects([mockImage])['asdf']).
        not.toEqual(undefined);
    });

    it('should replace spaces with underscores', function () {
      mockImage.name = 'Control Town';
      expect(FIB._extractObjects([mockImage])['Control_Town']).
        not.toEqual(undefined);
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
      expect(FIB._extractObjects([mockText])).toEqual({
        'MyLabel': {
          textAlign: 'center', 
          color: '#ff0000',
          font: {
            fontFamily: 'Helvetica',
            fontSize: 12
          },
          height: 40,
          left: 10,
          metaData: {type:'label'},
          name: 'MyLabel',
          text: 'Please Work',
          top: 0,
          width: 200
        }
      });
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
        metaData: {type:'label'},
        name: 't1',
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
        metaData: {type:'label'},
        name: 't2',
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
        metaData: {type:'label'},
        name: 't3',
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
      expect(objs['t1']).toEqual(t1Out);
    });
    it('should have label t2', function () {
      expect(objs['t2']).toEqual(t2Out);
    });
    it('should have label t3', function () {
      expect(objs['t3']).toEqual(t3Out);
    });
  });

  describe('Test text with null name', function () {
    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should use text for name if name is null', function () {
      var testText = new Text({name: null, textChars: 'Text Name'});
      var obj = FIB._extractObjects([testText]);
      expect(obj['__TestViewText1']).not.toEqual(undefined);
    });
  });

  describe('Image tests', function () {
    afterEach(function () {
      FibHelper.resetCounter();
    });

    it('should create an image ImageView object', function () {
      var testImg = new Image({name: 'img'});
      var obj = FIB._extractObjects([testImg]);
      expect(obj['img'].metaData.type).toEqual('image');
    });

    it('should create an instance ImageView object', function () {
      var testInst = new Instance({name: 'inst'});
      var obj = FIB._extractObjects([testInst]);
      expect(obj['inst'].metaData.type).toEqual('image');
    });

    it('should create a group ImageView object', function () {
      var test = new Group({name: 'grp'});
      obj = FIB._extractObjects([test]);
      expect(obj['grp'].metaData.type).toEqual('image');
    });

    it('should create a RectanglePrimitive ImageView object', function () {
      var test = new RectanglePrimitive({name: 'rect'});
      obj = FIB._extractObjects([test]);
      expect(obj['rect'].metaData.type).
        toEqual('image');
    });
    it('should create an invisi rectangle as hidden', function () {
      var test = new RectanglePrimitive({name: 'rect', visible: false});
      obj = FIB._extractObjects([test]);
      expect(obj['rect'].metaData.hidden).toEqual(true);
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
      expect(obj['__TestViewGroup1'].metaData.type).toEqual('button');
    });

    it('should create a button object image from a group', function () {
      var test = new Group({name: 'name:heya,type:button'});
      obj = FIB._extractObjects([test]);
      expect(obj['heya'].backgroundImage).toEqual(
        'images/TestView/heya.png');
    });

    it('should not create a button object if misspelled', function () {
      var test = new Group({name: 'type:btton'});
      obj = FIB._extractObjects([test]);
      expect(obj['__TestViewGroup1'].metaData.type).toEqual('btton');
    });

    it('should export a button with a disabled background', function() {
      var test = new Group({name: 'name:heya,type:button, inactive:test'});
      obj = FIB._extractObjects([test]);
      expect(obj['heya'].backgroundDisabledImage).toEqual(
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
      var test = new Group({name: 'name:hehe'});
      obj = FIB._extractObjects([test]);
      expect(obj['hehe'].metaData.type).toEqual('image');
    });

    it('should export a free image', function() {
      var test = new Instance({name: 'name:tehe, type:free_image'});
      obj = FIB._extractObjects([test]);
      expect(obj['tehe'].metaData.offset).toEqual({x: -10, y: -20});
    });

    it('should create a textfield from text', function() {
      var test = new Text({name: 'name:textytext, type:textfield',
        font: 'Museo-Bold', fontsize: 24});
      obj = FIB._extractObjects([test]);
      expect(obj['textytext']).toEqual({
        height: 0,
        left: 0,
        top: 0,
        width: 0,
        color: '#ff0000',
        name: 'textytext',
        font: { fontFamily: 'Museo-Bold', fontSize: 24 },
        metaData: {
          type: 'textfield'
        },
        textAlign: 'left',
        value: ''
      });
    });

    it('should create a textfield from text with hacked fonts', function() {
      var test = new Text({name: 'name:textytext, type:textfield',
        font: 'Gotham-Bold', fontsize: 24});
      obj = FIB._extractObjects([test]);
      expect(obj['textytext']).toEqual({
        height: 0,
        left: 0,
        top: 0,
        width: 0,
        color: '#ff0000',
        name: 'textytext',
        font: { fontFamily: 'GothamBold', fontSize: 24 },
        metaData: {
          type: 'textfield'
        },
        textAlign: 'left',
        value: ''
      });
    });

    it('should create a textfield from a group', function() {
      var test = new Group({name: 'name:nummy, type:textfield'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        name: 'nummy',
        backgroundColor: 'transparent',
        metaData: {
          type: 'textfield'
        }
      });
    });
    
    it('should export textfield colors and fonts', function() {
      var test = new Group({name: 'name:nummy, type:textfield,color:#666666,font:Museo-Bold,fontsize:27'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        name: 'nummy',
        backgroundColor: 'transparent',
        font: {fontFamily:'Museo-Bold', fontSize: '27'},
        color: '#666666',
        metaData: {
          type: 'textfield',
          color: '#666666',
          font: 'Museo-Bold',
          fontsize: '27'
        }
      });
    });

    it('should export textfield hacked fonts properly', function() {
      var test = new Group({name: 'name:nummy, type:textfield,color:#666666,font:Gotham-Bold-Italic,fontsize:27'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        name: 'nummy',
        backgroundColor: 'transparent',
        font: {fontFamily:'GothamBoldItalic', fontSize: '27'},
        color: '#666666',
        metaData: {
          type: 'textfield',
          color: '#666666',
          font: 'Gotham-Bold-Italic',
          fontsize: '27'
        }
      });
    });

    it('should create a textarea from a group', function() {
      var test = new Group({name: 'name:nummy, type:textarea'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        name: 'nummy',
        backgroundColor: 'transparent',
        metaData: {
          type: 'textarea'
        }
      });
    });
    
    it('should create a switch from a group', function() {
      var test = new Group({name: 'name:nummy,type:switch,value:false'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        left: 0,
        top: 0,
        height: 0,
        width: 0,
        value: false,
        name: 'nummy',
        metaData: {
          type: 'switch',
          value: 'false'
        }
      })
    })

    it('should create a numbox from a group', function() {
      var test = new Group(
        {name: 'name:nummy, type:textfield, keypad:num'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        name: 'nummy',
        backgroundColor: 'transparent',
        metaData: {
          type: 'textfield',
          keypad: 'num'
        }
      });
    });

    it('should create a textbox image from a group', function() {
      var test = new Group({name: 'name:nummy, type:textfield'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy_img']).toEqual({
        height: 'auto',
        left: 0,
        top: 0,
        width: 'auto',
        image: 'images/TestView/nummy_img.png',
        name: 'nummy_img',
        metaData: {
          type: 'image'
        }
      });
    });

    it('should create a textarea image from a group', function() {
      var test = new Group({name: 'name:nummy, type:textarea'});
      obj = FIB._extractObjects([test]);
      expect(obj['nummy_img']).toEqual({
        height: 'auto',
        left: 0,
        top: 0,
        width: 'auto',
        image: 'images/TestView/nummy_img.png',
        name: 'nummy_img',
        metaData: {
          type: 'image'
        }
      });
    });

    it('should create a textbox from a group with background', function() {
      var test = new Group({
        name: 'name:nummy, type:textfield', 
        pathAttributes: {
          fillColor: '#ffffff'
        }
      });

      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        height: 0,
        left: 5,
        top: 0,
        width: -10,
        name: 'nummy',
        metaData: {
          type: 'textfield'
        },
        backgroundColor: 'transparent'
      });
    });

    it('should create a table view object', function () {
      var test = new RectanglePrimitive({
        name: 'name:tab, type:table',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj['tab']).toEqual({
          top: 0,
          left: 0,
          metaData: {type: 'table'},
          name: 'tab',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200,
          backgroundImage: 'images/TestView/tab.png'
      });
    });

    it('should create a table view object without img', function () {
      var test = new RectanglePrimitive({
        name: 'name:tab, type:table',
        opacity: 0,
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj['tab']).toEqual({
          top: 0,
          left: 0,
          metaData: {type: 'table'},
          name: 'tab',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200
      });
    });

    it('should create a scrollable view object', function () {
      var test = new RectanglePrimitive({
        name: 'name:scr, type:scrollable',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj['scr']).toEqual({
          top: 0,
          left: 0,
          metaData: {type: 'scrollable'},
          name: 'scr',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200,
          backgroundImage: 'images/TestView/scr.png'
      });
    });

    it('should create a scrollable view object without img', function () {
      var test = new RectanglePrimitive({
        name: 'name:scr, type:scrollable',
        opacity: 0,
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj['scr']).toEqual({
          top: 0,
          left: 0,
          metaData: {type: 'scrollable'},
          name: 'scr',
          contentWidth: 'auto',
          contentHeight: 'auto',
          height: 100,
          width: 200
      });
    });

    it('should create a scroll view object', function () {
      var test = new RectanglePrimitive({
        name: 'name:scr, type:scroll',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj['scroll_view']).toEqual({
          left: 0,
          top: 0,
          metaData: {type: 'scroll'},
          name: 'scroll_view',
          height: 100,
          width: 200
      });
    });

    it('should create a progressbar', function() {
      var test = new Group({
        name: 'name:nummy, type:progress, bgcolor: #333333, inverted:true',
        left: 50,
        top: 20,
        width: 100,
        height: 20
      });

      obj = FIB._extractObjects([test]);
      expect(obj['nummy']).toEqual({
        height: 20,
        left: 50,
        top: 20,
        width: 100,
        name: 'nummy',
        metaData: {
          type: 'progress',
          bgcolor: '#333333',
          inverted: 'true'
        },
        bgcolor: '#333333',
        inverted: 'true',
        image: 'images/TestView/nummy.png'
      });
    });

    it('should create a web view object', function () {
      var test = new RectanglePrimitive({
        name: 'name:webby, type:web, url:testurl.html',
        height: 100, 
        width: 200
      });
      obj = FIB._extractObjects([test]);
      expect(obj['webby']).toEqual({
          left: 0,
          top: 0,
          metaData: {type: 'web', url:'testurl.html'},
          name: 'webby',
          height: 100,
          width: 200,
          url:'testurl.html'
      });
    });
  });

  describe('Test extract meta data function', function () {
    it('should return empty object when given an empty string', function () {
      expect(FIB._extractMetaData('')).toEqual({});
    });

    it('should return empty object if no colon anywhere', function () {
      expect(FIB._extractMetaData('asdf')).toEqual({name: 'asdf'});
    });

    it('should return an object with a button type', function () {
      expect(FIB._extractMetaData('type:button')).toEqual({type:'button'});
    });
    it('should return an obj w button type even with space', function () {
      expect(FIB._extractMetaData('type : button ')).
        toEqual({type:'button'});
    });
    it('should return an obj with 2 props', function () {
      expect(FIB._extractMetaData('type: button, click:callback')).
        toEqual({type:'button', click:'callback'});
    });
  });

  describe('Test the full export function', function () {
    
    var files;
    var cSpy, oSpy, wSpy, clSpy, utf8Spy;
    
    describe('Make sure scroll_view not exported', function() {
      beforeEach(function () {
        fw._mockDOM.topLayers = [new RectanglePrimitive({
          name: 'name:scroll_view, type:scroll',
          width: 200,
          height: 200
        })];
        utf8Spy = spyOn(fw._mockFile, 'writeUTF8');
        FIB.exportInterface();
      });

      afterEach(function () {
        FibHelper.resetCounter();
      });
      
      it('should not export scroll_view', function() {
        expect(utf8Spy.mostRecentCall.args[0]['scroll_view']).
          toEqual(undefined);
      });
    });

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
          dojo.toJson({
            "BigTest": {
              "left": 0,
              "top": 0,
              "height": 0,
              "width": 0,
              "metaData":{"type":"label"},
              "name":"BigTest",
              "textAlign":"left",
              "color":"#ff0000",
              "font":{"fontFamily":"","fontSize":0},
              "text":""
            }
          }, true, '  '));
      });

      it('should never call the write command', function () {
        expect(wSpy).not.toHaveBeenCalled();
      });

      it('should open a file in the mock Test View Directory', function () {
        expect(cSpy).toHaveBeenCalledWith('~/TestDir/styles/TestView.json',
          'json', 'FWMX');
      });
    });
  });
});
