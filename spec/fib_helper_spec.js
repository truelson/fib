/* File: fib.spec.js
 * Authors: Palmer Truelson
 * Company: Massive Health, LLC
 * Licence: $LICENSE
 * About: Fib unit tests 
 */
describe('Fib Helper Tests!', function () {

  beforeEach(function() {
    fw._resetMockDom(fw._mockDOM);
    fw.selection = [];
  });

  describe('Helper Function tests', function () {

    it('should have a working object type function', function () {
      expect(FibHelper.objType([])).toEqual('Array');
    });

    describe('ExportPNG function', function () {
      var img;

      beforeEach(function() {
        img = new Image({ 
          name: 'TestImage', 
          left: 0,
          top: 0,
          width: 20, 
          height: 30, 
          pixelRect: {top:5, bottom:25, left: 5, right: 15}
        });
      });

      it('should maintain selection', function () {
        fw.selection = 'test';
        FibHelper.exportPNG(img, 'TestPlace');
        expect(fw.selection).toEqual('test');
      });

      it('should set exportOptions.exportFormat to PNG', function() {
        FibHelper.exportPNG(img, 'TestPlace');
        expect(fw._mockDOM.exportOptions.exportFormat).toEqual('PNG');
      });

      it('should set canvas size to full bounds', function() {
        spyOn(FibHelper, 'getActualSize').andReturn({
          left: 0, top:0, right: 20, bottom: 30
        });
        spyOn(fw._mockDOM, 'setDocumentCanvasSize');
        FibHelper.exportPNG(img, 'TestImage');
        expect(fw._mockDOM.setDocumentCanvasSize).toHaveBeenCalledWith({
          left: 0, top:0, right: 20, bottom: 30
        }, true);
      });
    });

    describe('Get Actual Size from Object tests', function() {
      var test_obj, test_rect_small, test_rect_big;

      beforeEach(function() {
        test_obj = {
          left: 5,
          top: 10,
          width: 20,
          height: 30
        };

        test_rect_small = {
          left: 6,
          top: 11,
          right: 24,
          bottom: 36
        };

        test_rect_big = {
          left: 4,
          top: 9,
          right: 26,
          bottom: 41
        };

        this.addMatchers({
          toBeSameSizeAs: function(sizeObj) {
            if (sizeObj.width !== this.actual.width ||
                sizeObj.height !== this.actual.height ||
                sizeObj.left !== this.actual.left ||
                sizeObj.top !== this.actual.top) {
              return false;
            }

            return true;
          }
        }); 
      });

      it('should extract same size if no pixelRect', function() {
        expect(FibHelper.getActualSize(test_obj)).toBeSameSizeAs(test_obj);
      });

      it('should extract same size if small pixel rect', function() {
        test_obj.pixelRect = test_rect_small;
        expect(FibHelper.getActualSize(test_obj)).toBeSameSizeAs(test_obj);
      });

      it('should extract pixel rect size if big pixel rect', function() {
        test_obj.pixelRect = test_rect_big;
        expect(FibHelper.getActualSize(test_obj)).toBeSameSizeAs({
          left: 4,
          top: 9,
          width: 22,
          height: 32
        });
      });
    });
  });
});
