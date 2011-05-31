if ( typeof dojo !== 'undefined' )
  dojo.provide( 'fib_extractor' )

FibExtractor = {}

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

  metadata = FibHelper.parseMetadata( fireworksObject.name )
  
  _.extend( outObject, metadata )

  if( !metadata.id || outObject.id == '' )
    outObject.id = FibHelper.getUniqueName( fireworksObject )
  
  FibHelper.nameMap[ outObject.id ] = true

  return outObject
}

FibExtractor.extractImage = function( fireworksObject, outObject, parent) {

  outObject.image = FibHelper.imagesDir + outObject.id + '.png'

  if ( outObject.inactive ) {
    outObject.backgroundDisabledImage = FibHelper.imagesDir +
      outObject.inactive + '.png'
    delete outObject.inactive
  }

  FibHelper.exportPNG( fireworksObject, outObject.id )

  return outObject
}

FibExtractor.extractorTypeSetup = function() {
  var newExtractor = {}

  newExtractor.image = FibExtractor.extractImage

  return newExtractor
}

FibExtractor.extractorType = {}

FibExtractor.extractorType.RectanglePrimitive =
  function( fireworksObject, parent ) {

    var outObject = FibExtractor.extractBasic( fireworksObject, parent )
    
    rectangleExtractor = FibExtractor.extractorTypeSetup()

    rectangleExtractor.view =
      function( fireworksObject, outObject, parent ) {

        outObject.background = fireworksObject.pathAttributes.fillColor
        outObject.borderWidth = fireworksObject.pathAttributes.brush
          ? fireworksObject.pathAttributes.brush.diameter
          : 0
        outObject.borderColor = fireworksObject.pathAttributes.brushColor

      }

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
      }

    if ( typeof outObject.type === 'undefined' ) outObject.type = 'canvas'

    if ( rectangleExtractor.hasOwnProperty( outObject.type )) {
      rectangleExtractor[ outObject.type ]( fireworksObject, outObject,
        parent )
    }
    
    return outObject
  }

FibExtractor.extract = function( fireworksObject ) {
  
  var fireworksType = FibHelper.objectType( fireworksObject )

  if ( FibExtractor.extractorType.hasOwnProperty( fireworksType ))
    return FibExtractor.extractorType[ fireworksType ]( fireworksObject )
  else return FibExtractor.extractBasic( fireworksObject )
}

if ( fw._mockFile ) exports.FibExtractor = FibExtractor
