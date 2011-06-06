if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_extractor' )

FibExtractor = {}

FibExtractor.shouldExtractVectorAsImage = function( fireworksObject ) {

  if ( fireworksObject.contours.length > 1 )
    return true

  if ( fireworksObject.pathAttributes.fill &&
       (( fireworksObject.pathAttributes.fill.name !== 'Solid' ) ||
       ( fireworksObject.pathAttributes.fill.textureBlend > 0 ))) {
    return true
  }

  return false
}

FibExtractor.extractBasic = function( fireworksObject, parent ) {

  var outObject     = {}
  ,   outSize       = FibHelper.getActualSize( fireworksObject )
  ,   parentOutSize = parent
    ? FibHelper.getActualSize( parent )
    : undefined

  outObject.left = outSize.left - ( parentOutSize ? parentOutSize.left : 0 )
  outObject.top = outSize.top - ( parentOutSize ? parentOutSize.top : 0 )

  outObject.height = outSize.height
  outObject.width = outSize.width

  if ( typeof fireworksObject.opacity !== 'undefined' )
    outObject.opacity = fireworksObject.opacity / 100

  metadata = FibHelper.parseMetadata( fireworksObject.name )
  
  _.extend( outObject, metadata )

  if( !metadata.id || outObject.id == '' )
    outObject.id = FibHelper.getUniqueName( fireworksObject )
  
  FibHelper.nameMap[ outObject.id ] = true

  return outObject
}

FibExtractor.extractImage = function( fireworksObject, outObject, parent) {

  outObject.image = FibHelper.imagesDir + outObject.id + '.png'

  if ( typeof outObject.opacity !== 'undefined' ) delete outObject.opacity

  if ( outObject.inactive ) {
    outObject.backgroundDisabledImage = FibHelper.imagesDir +
      outObject.inactive + '.png'
    delete outObject.inactive
  }

  FibHelper.exportPNG( fireworksObject, outObject.id )

  return outObject
}

FibExtractor.extractFreeImage = function( fireworksObject, outObject ) {

  FibHelper.exportPNG( fireworksObject, outObject.id )

  return null
}

FibExtractor.extractTextfield = function( fireworksObject, outObject ) {

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

  return FibHelper.shortenFont( outObject )
}

FibExtractor.extractTextarea = FibExtractor.extractTextfield

FibExtractor.extractSimpleRectangle =
  function( fireworksObject, outObject, parent ) {

    outObject.background = fireworksObject.pathAttributes.fillColor
    outObject.borderWidth = fireworksObject.pathAttributes.brush
      ? fireworksObject.pathAttributes.brush.diameter
      : 0
    outObject.borderColor = fireworksObject.pathAttributes.brushColor

    outObject.borderRadius = fireworksObject.roundness || 0

    return outObject
  }



FibExtractor.fireworksExtractorTypeSetup = function() {
  var newExtractor = {}

  newExtractor.button = function( fireworksObject, outObject, parent ) {

    outObject = FibExtractor.extractImage(
      fireworksObject, outObject, parent )

    outObject.backgroundImage = outObject.image
    delete outObject.image

    return outObject
  }

  newExtractor.image = FibExtractor.extractImage

  newExtractor.free_image = FibExtractor.extractFreeImage

  newExtractor.textfield = FibExtractor.extractTextfield

  newExtractor.textarea = FibExtractor.extractTextarea

  newExtractor['switch'] = function( fireworksObject, outObject ) {
    if ( !outObject.value ) outObject.value = false
    return outObject
  }

  return newExtractor
}

FibExtractor.fireworksExtractorType = {}



FibExtractor.fireworksExtractorType.Layer =
  function( fireworksObject, parent ) {

    if ( fireworksObject.layerType !== 'web' )
      return FibExtractor.extractObjects( fireworksObject.elems, parent )

    return []
  }

FibExtractor.fireworksExtractorType.Group =
  function( fireworksObject, parent ) {

    var outObject    = FibExtractor.extractBasic( fireworksObject, parent )
    ,   groupExtractor = FibExtractor.fireworksExtractorTypeSetup()

    groupExtractor.view = function( fireworksObject, outObject, parent ) {
      outObject.children = []

      _(fireworksObject.elements).each( function ( element ) {
        outObject.children.unshift(
          FibExtractor.extract( element, fireworksObject ))
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

FibExtractor.fireworksExtractorType.RectanglePrimitive =
  function( fireworksObject, parent ) {

    var outObject     = FibExtractor.extractBasic( fireworksObject, parent )
    ,   rectangleExtractor = FibExtractor.fireworksExtractorTypeSetup()

    rectangleExtractor.view = FibExtractor.extractSimpleRectangle

    rectangleExtractor.canvas =
      function( fireworksObject, outObject, parent ) {

        outObject.drawList = []

        var outContour =  {
          type: 'rect',
          background: fireworksObject.pathAttributes.fillColor,
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

    if ( typeof outObject.type === 'undefined' ) outObject.type = 'view'

    if ( rectangleExtractor.hasOwnProperty( outObject.type )) {
      return rectangleExtractor[ outObject.type ]( fireworksObject,
        outObject, parent )
    }
    
    return outObject
  }

FibExtractor.fireworksExtractorType.Path =
  function( fireworksObject, parent ) {

    var outObject     = FibExtractor.extractBasic( fireworksObject, parent )
    ,   isImage       = FibExtractor.shouldExtractVectorAsImage(
      fireworksObject )
    ,   pathExtractor = FibExtractor.fireworksExtractorTypeSetup()

    pathExtractor.view = FibExtractor.extractSimpleRectangle

    pathExtractor.canvas = function( fireworksObject, outObject, parent ) {

      var parentOutSize = parent
        ? FibHelper.getActualSize( parent )
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

        if ( fireworksObject.pathAttributes.fill )
          outContour.background = fireworksObject.pathAttributes.fillColor

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

        outObject.drawList.push( outContour )
      })

      return outObject
    }

    if ( outObject.type === 'canvas' && isImage ) {
      alert( outObject.name + ' cannot be a canvas.  Making it an image.' )
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

FibExtractor.fireworksExtractorType.Image =
  function( fireworksObject, parent ) {

    var outObject = FibExtractor.extractBasic( fireworksObject, parent )
    ,   imageExtractor = FibExtractor.fireworksExtractorTypeSetup()

    if ( typeof outObject.type === 'undefined' ) outObject.type = 'image'

    if ( outObject.type === 'canvas' ) {
      outObject.type = 'image'
      alert( fireworksObject.name + ' cannot be a canvas, it\'s an image' )
    }

    if ( imageExtractor.hasOwnProperty( outObject.type )) {
      return imageExtractor[ outObject.type ]( fireworksObject,
        outObject, parent )
    }

    return outObject
  }

FibExtractor.fireworksExtractorType.Instance =
  FibExtractor.fireworksExtractorType.Image

FibExtractor.fireworksExtractorType.Text =
  function( fireworksObject, parent ) {

    var outObject     = FibExtractor.extractBasic( fireworksObject, parent )
    ,   textExtractor = FibExtractor.fireworksExtractorTypeSetup()

    var getTextProperties = function( fireworksObject, outObject ) {
      outObject.textAlign = fireworksObject.alignment
      outObject.color = fireworksObject.pathAttributes.fillColor
      outObject.font = {
        fontFamily: fireworksObject.font,
        fontSize: fireworksObject.fontsize
      }

      return FibHelper.shortenFont( outObject )
    }

    textExtractor.textfield =
      function( fireworksObject, outObject, parent) {
        outObject =
          FibExtractor.extractTextfield( fireworksObject, outObject )

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



FibExtractor.extract = function( fireworksObject, parent ) {
  
  var fireworksType = FibHelper.objectType( fireworksObject )

  if ( FibExtractor.fireworksExtractorType
        .hasOwnProperty( fireworksType )) {
    return FibExtractor
      .fireworksExtractorType[ fireworksType ]( fireworksObject, parent )
  }
  else return FibExtractor.extractBasic( fireworksObject, parent )
}

FibExtractor.extractObjects = function( fireworksContainer, parent ) {

  var result = []

  _.map( fireworksContainer, function( fireworksObject ) {
    var outObject = FibExtractor.extract( fireworksObject, parent )
    if ( outObject ) result.unshift( outObject )
  })

  return _(result).chain().flatten().compact().value()
}

if ( fw._mockFile ) exports.FibExtractor = FibExtractor
