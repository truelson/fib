if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_extractor' )

var FibExtractor = {}

FibExtractor.createFibExtractor = function( fibHelper ) {

  var fibExtractor = {}

  fibExtractor.shouldExtractVectorAsImage = function( fireworksObject ) {

    if ( fireworksObject.contours && fireworksObject.contours.length > 1 )
      return true

    if ( fireworksObject.pathAttributes.fill &&
         (( fireworksObject.pathAttributes.fill.name !== 'Solid' &&
            fireworksObject.pathAttributes.fill.shape !== 'solid' ) ||
         ( fireworksObject.pathAttributes.fill.textureBlend > 0 ))) {
      return true
    }

    return false
  }

  fibExtractor.extractBasic = function( fireworksObject, parent ) {

    var outObject     = {}
    ,   outSize       = fibHelper.getActualSize( fireworksObject )
    ,   parentOutSize = parent
      ? fibHelper.getActualSize( parent )
      : undefined

    outObject.left =
      outSize.left - ( parentOutSize ? parentOutSize.left : 0 )

    outObject.top = outSize.top - ( parentOutSize ? parentOutSize.top : 0 )

    outObject.height = outSize.height
    outObject.width = outSize.width

    if ( typeof fireworksObject.opacity !== 'undefined' )
      outObject.opacity = fireworksObject.opacity / 100

    metadata = fibHelper.parseMetadata( fireworksObject.name )

    _.extend( outObject, metadata )

    if ( !metadata.id || outObject.id == '' )
      outObject.id = fibHelper.getUniqueName( fireworksObject )

    if ( !fibHelper.isNameUnique( outObject.id )) {
      var id = fibHelper.getUniqueName( fireworksObject )

      var warnText = 'The object: \'' + fireworksObject.name
        + '\' is used multiple times.\nExporting one with ID as: ' + id

      if ( parent ) {
        warnText += '.\nParent of object is ' + parent.name + '. '
      } else {
        warnText += '.\nObject has no parent.'
      }

      warnText += '\nPlease change this ID in Fireworks.'

      fibHelper.addWarning( warnText )

      outObject.id = id
    }

    fibHelper.nameMap[ outObject.id ] = true

    return outObject
  }

  fibExtractor.extractImage =
    function( fireworksObject, outObject, parent ) {

      outObject.image = fibHelper.getImagesDir() + outObject.id + '.png'

      if ( typeof outObject.opacity !== 'undefined' )
        delete outObject.opacity

      if ( outObject.inactive ) {
        outObject.backgroundDisabledImage = fibHelper.getImagesDir() +
          outObject.inactive + '.png'
        delete outObject.inactive
      }

      fibHelper.exportPNG( fireworksObject, outObject.id )

      return outObject
    }

  fibExtractor.extractFreeImage = function( fireworksObject, outObject ) {

    fibHelper.exportPNG( fireworksObject, outObject.id )

    return null
  }

  fibExtractor.extractTextfield = function( fireworksObject, outObject ) {

    outObject.backgroundColor = 'transparent'

    if ( outObject.font || outObject.fontsize ) {
      var fontFamily = outObject.font
      outObject.font = {}

      if ( fontFamily )
        outObject.font.fontFamily = fontFamily

      if( outObject.fontsize ) {
        outObject.font.fontSize = outObject.fontsize
        delete outObject.fontsize
      }
    }

    return fibHelper.shortenFont( outObject )
  }

  fibExtractor.extractTextarea = fibExtractor.extractTextfield

  fibExtractor.extractSimpleRectangle =
    function( fireworksObject, outObject, parent ) {

      if ( fireworksObject.pathAttributes.fill )
        outObject.backgroundColor = fireworksObject.pathAttributes.fillColor

      if( fireworksObject.pathAttributes.brush ) {
        outObject.borderWidth =
          fireworksObject.pathAttributes.brush.diameter
        outObject.borderColor = fireworksObject.pathAttributes.brushColor
        outObject.borderRadius = fireworksObject.roundness || 0
      }

      return outObject
    }



  fibExtractor.fireworksExtractorTypeSetup = function() {
    var newExtractor = {}

    newExtractor.button = function( fireworksObject, outObject, parent ) {

      outObject = fibExtractor.extractImage(
        fireworksObject, outObject, parent )

      outObject.backgroundImage = outObject.image
      delete outObject.image

      return outObject
    }

    newExtractor.image = fibExtractor.extractImage

    newExtractor.free_image = fibExtractor.extractFreeImage

    newExtractor.textfield = fibExtractor.extractTextfield

    newExtractor.textarea = fibExtractor.extractTextarea

    newExtractor['switch'] = function( fireworksObject, outObject ) {
      if ( !outObject.value ) outObject.value = false
      return outObject
    }

    return newExtractor
  }

  fibExtractor.fireworksExtractorType = {}



  fibExtractor.fireworksExtractorType.Layer =
    function( fireworksObject, parent ) {

      if ( fireworksObject.layerType !== 'web' )
        return fibExtractor.extractObjects( fireworksObject.elems, parent )

      return []
    }

  fibExtractor.fireworksExtractorType.Group =
    function( fireworksObject, parent ) {

      var outObject = fibExtractor.extractBasic( fireworksObject, parent )
      ,   groupExtractor = fibExtractor.fireworksExtractorTypeSetup()

      groupExtractor.view = function( fireworksObject, outObject, parent ) {
        outObject.children = []

        _(fireworksObject.elements).each( function ( element ) {
          outObject.children.unshift(
            fibExtractor.extract( element, fireworksObject ))
        })

        return outObject
      }

      if ( typeof outObject.type === 'undefined' ) outObject.type = 'view'

      if ( groupExtractor.hasOwnProperty( outObject.type )) {
        return groupExtractor[ outObject.type ]( fireworksObject,
          outObject, parent )
      }

      return outObject
    }

  fibExtractor.fireworksExtractorType.RectanglePrimitive =
    function( fireworksObject, parent ) {

      var outObject = fibExtractor.extractBasic( fireworksObject, parent )
      ,   rectangleExtractor = fibExtractor.fireworksExtractorTypeSetup()
      ,   isImage = fibExtractor
                      .shouldExtractVectorAsImage( fireworksObject )

      rectangleExtractor.view = fibExtractor.extractSimpleRectangle

      rectangleExtractor.canvas =
        function( fireworksObject, outObject, parent ) {

          outObject.drawList = []

          var outContour =  {
            type: 'rect',
            backgroundColor: fireworksObject.pathAttributes.fillColor,
            color: fireworksObject.pathAttributes.brushColor,
            lineWidth: fireworksObject.pathAttributes.brush
              ? fireworksObject.pathAttributes.brush.diameter : 0,
            x: 0,
            y: 0,
            width: outObject.width,
            height: outObject.height
          }

          outObject.drawList.unshift( outContour )

          return outObject
        }

      if ( outObject.type === 'view' && isImage ) {
        fibHelper.addWarning( outObject.name
          + ' cannot be a view.  Exported as an image.' )
        outObject.type = 'image'
      }


      if ( typeof outObject.type === 'undefined' )
        outObject.type = isImage ? 'image' : 'view'

      if ( rectangleExtractor.hasOwnProperty( outObject.type )) {
        return rectangleExtractor[ outObject.type ]( fireworksObject,
          outObject, parent )
      }

      return outObject
    }

  fibExtractor.fireworksExtractorType.Path =
    function( fireworksObject, parent ) {

      var outObject = fibExtractor.extractBasic( fireworksObject, parent )
      ,   isImage   = fibExtractor.shouldExtractVectorAsImage(
        fireworksObject )
      ,   pathExtractor = fibExtractor.fireworksExtractorTypeSetup()

      pathExtractor.view = fibExtractor.extractSimpleRectangle

      pathExtractor.canvas =
        function( fireworksObject, outObject, parent ) {

          var parentOutSize = parent
            ? fibHelper.getActualSize( parent )
            : undefined

          var canvasLeft = (parentOutSize ? parentOutSize.left : 0 )
            + outObject.left
          ,   canvasTop = (parentOutSize ? parentOutSize.top : 0 )
            + outObject.top

          outObject.drawList = []
          _(fireworksObject.contours).each( function ( contour ) {
            var nodes = contour.nodes

            var outContour =  {
              type: 'curve',
              close: contour.isClosed,
              points: []
            }

            if ( fireworksObject.pathAttributes.brush ) {
              outContour.color =  fireworksObject.pathAttributes.brushColor,
              outContour.lineWidth =
                fireworksObject.pathAttributes.brush.diameter
            }

            if ( fireworksObject.pathAttributes.fill ) {
              outContour.backgroundColor =
                fireworksObject.pathAttributes.fillColor
            }

            _(nodes).each( function ( point ) {
              var p = {
                x: point.x - canvasLeft,
                y: point.y - canvasTop,
                predX: point.predX - canvasLeft,
                predY: point.predY - canvasTop,
                succX: point.succX - canvasLeft,
                succY: point.succY - canvasTop
              }
              outContour.points.push( p )
            })

            outContour.x = 0
            outContour.y = 0

            outObject.drawList.push( outContour )
          })

          return outObject
        }

      if ( outObject.type === 'canvas' && isImage ) {
        fibHelper.addWarning( outObject.name +
          ' cannot be a canvas.  Exporting as an image.' )
        outObject.type = 'image'
      }

      if ( typeof outObject.type === 'undefined' )
        outObject.type = isImage ? 'image' : 'canvas'

      if ( pathExtractor.hasOwnProperty( outObject.type )) {
        return pathExtractor[ outObject.type ]( fireworksObject,
          outObject, parent )
      }

      return outObject
    }

  fibExtractor.fireworksExtractorType.Image =
    function( fireworksObject, parent ) {

      var outObject = fibExtractor.extractBasic( fireworksObject, parent )
      ,   imageExtractor = fibExtractor.fireworksExtractorTypeSetup()

      if ( typeof outObject.type === 'undefined' ) outObject.type = 'image'

      if ( outObject.type === 'canvas' ) {
        outObject.type = 'image'
        fibHelper.addWarning( fireworksObject.name +
          ' cannot be a canvas, exporting as an image' )
      }

      if ( imageExtractor.hasOwnProperty( outObject.type )) {
        return imageExtractor[ outObject.type ]( fireworksObject,
          outObject, parent )
      }

      return outObject
    }

  fibExtractor.fireworksExtractorType.Instance =
    fibExtractor.fireworksExtractorType.Image

  fibExtractor.fireworksExtractorType.Text =
    function( fireworksObject, parent ) {

      var outObject = fibExtractor.extractBasic( fireworksObject, parent )
      ,   textExtractor = fibExtractor.fireworksExtractorTypeSetup()

      var getTextProperties = function( fireworksObject, outObject ) {
        outObject.textAlign = fireworksObject.alignment
        outObject.color = fireworksObject.pathAttributes.fillColor
        outObject.font = {
          fontFamily: fireworksObject.font,
          fontSize: fireworksObject.fontsize
        }

        return fibHelper.shortenFont( outObject )
      }

      textExtractor.textfield =
        function( fireworksObject, outObject, parent) {
          outObject =
            fibExtractor.extractTextfield( fireworksObject, outObject )

          outObject = getTextProperties( fireworksObject, outObject )
          outObject.value = fireworksObject.textChars

          return outObject
        }

      textExtractor.textarea = textExtractor.textfield

      textExtractor.label = function( fireworksObject, outObject, parent) {
        outObject = getTextProperties( fireworksObject, outObject )
        outObject.text = fireworksObject.textChars

        return outObject
      }

      if ( typeof outObject.type === 'undefined' ) outObject.type = 'label'

      if ( textExtractor.hasOwnProperty( outObject.type )) {
        return textExtractor[ outObject.type ]( fireworksObject,
          outObject, parent )
      }

      return outObject
    }



  fibExtractor.extract = function( fireworksObject, parent ) {

    var fireworksType = fibHelper.objectType( fireworksObject )

    if ( fibExtractor.fireworksExtractorType
          .hasOwnProperty( fireworksType )) {
      return fibExtractor
        .fireworksExtractorType[ fireworksType ]( fireworksObject, parent )
    }
    else return fibExtractor.extractBasic( fireworksObject, parent )
  }

  fibExtractor.extractObjects = function( fireworksContainer, parent ) {

    var result = []

    _.map( fireworksContainer, function( fireworksObject ) {
      var outObject = fibExtractor.extract( fireworksObject, parent )
      if ( outObject ) result.unshift( outObject )
    })

    return _(result).chain().flatten().compact().value()
  }

  return fibExtractor
}

if ( fw._mockFile ) exports.FibExtractor = FibExtractor
