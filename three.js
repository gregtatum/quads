var quad = require('./index')

module.exports = function callToBufferGeometry (quads, threeOrBufferGeometry, bufferAttribute) {
  // Get a good reference to BufferGeometry and BufferAttribute
  var THREE, BufferGeometry, BufferAttribute

  if (!threeOrBufferGeometry) {
    THREE = window.THREE
  }

  if (
    typeof threeOrBufferGeometry === 'object' &&
    typeof threeOrBufferGeometry.BufferGeometry === 'function'
  ) {
    THREE = threeOrBufferGeometry
  }

  if (THREE) {
    BufferGeometry = THREE.BufferGeometry
    BufferAttribute = THREE.BufferAttribute
  } else if (
    typeof threeOrBufferGeometry === 'function' &&
    typeof bufferAttribute === 'function'
  ) {
    BufferGeometry = threeOrBufferGeometry
    BufferAttribute = bufferAttribute
  } else {
    throw new Error(
      'The second parameter must be either the THREE global, or the second and third ' +
      'parameters must be THREE.BufferGeometry and THREE.BufferAttribute respectively.'
    )
  }

  return toBufferGeometry(quads, BufferGeometry, BufferAttribute)
}

function toBufferGeometry (quads, BufferGeometry, BufferAttribute) {
  var geometry = new BufferGeometry()
  var positions = new Float32Array(quads.positions.length * 3)
  var normals = new Float32Array(quads.normals.length * 3)
  var indices = quad.elementsFromQuads(quads)

  for (let i = 0; i < quads.positions.length; i++) {
    const position = quads.positions[i]
    const normal = quads.normal[i]
    positions[i * 3] = position[0]
    positions[i * 3 + 1] = position[1]
    positions[i * 3 + 2] = position[2]
    normals[i * 3] = normal[0]
    normals[i * 3 + 1] = normal[1]
    normals[i * 3 + 2] = normal[2]
  }

  geometry.setIndex(new BufferAttribute(indices, 1))
  geometry.addAttribute('position', new BufferAttribute(positions, 3))
  geometry.addAttribute('normal', new BufferAttribute(normals, 3))

  return geometry
}
