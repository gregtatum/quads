const test = require('tape')
const quad = require('./quads')

test('createQuad', t => {
  test('createQuad with w h', t => {
    const {mesh, cell} = quad.createQuad({w: 2, h: 6})
    t.plan(2)
    t.deepLooseEqual(mesh, {
      positions: [[-1, 0, -3], [-1, 0, 3], [1, 0, 3], [1, 0, -3]],
      normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
      cells: [[0, 1, 2, 3]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [0, 1, 2, 3], 'The cell is also returned.')
  })

  test('createQuad with positions', t => {
    const {mesh, cell} = quad.createQuad({positions: [[-1, 0, -3], [-1, 0, 3], [1, 0, 3], [1, 0, -3]]})
    t.plan(2)
    t.deepLooseEqual(mesh, {
      positions: [[-1, 0, -3], [-1, 0, 3], [1, 0, 3], [1, 0, -3]],
      normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
      cells: [[0, 1, 2, 3]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [0, 1, 2, 3], 'The cell is also returned.')
  })

  test('createQuad with nothing', t => {
    const {mesh, cell} = quad.createQuad()
    t.plan(2)
    t.deepLooseEqual(mesh, {
      positions: [[-0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, 0.5], [0.5, 0, -0.5]],
      normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
      cells: [[0, 1, 2, 3]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [0, 1, 2, 3], 'The cell is also returned.')
  })

  test('createQuad with w h and facing a direction', t => {
    const {mesh, cell} = quad.createQuad({w: 2, h: 6, facing: 'z-'})
    t.plan(2)
    t.deepLooseEqual(mesh, {
      positions: [[1, -3, 0], [1, 3, 0], [-1, 3, 0], [-1, -3, 0]],
      normals: [[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]],
      cells: [[3, 2, 1, 0]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [3, 2, 1, 0], 'The cell is also returned.')
  })

  test('createQuad normal facing is correct', t => {
    t.plan(6)
    const xp = quad.createQuad({facing: 'x+'})
    t.deepLooseEqual(xp.mesh.normals[0], [1, 0, 0], 'x+ points up')
    const xm = quad.createQuad({facing: 'x-'})
    t.deepLooseEqual(xm.mesh.normals[0], [-1, 0, 0], 'x- points down')
    const yp = quad.createQuad({facing: 'y+'})
    t.deepLooseEqual(yp.mesh.normals[0], [0, 1, 0], 'y+ points up')
    const ym = quad.createQuad({facing: 'y-'})
    t.deepLooseEqual(ym.mesh.normals[0], [0, -1, 0], 'y- points down')
    const zp = quad.createQuad({facing: 'z+'})
    t.deepLooseEqual(zp.mesh.normals[0], [0, 0, 1], 'z+ points up')
    const zm = quad.createQuad({facing: 'z-'})
    t.deepLooseEqual(zm.mesh.normals[0], [0, 0, -1], 'z- points down')
  })
  t.end()
})

test.skip('averageNormalForPosition', t => {
  const mesh = quad.createBox(1, 1, 1)
  quad.subdivide(mesh, 1)
  const index = 0

  t.deepLooseEqual(
    mesh.normals[index],
    [ -0.5773502691896258, 0.5773502691896258, -0.5773502691896258 ],
    'Normal is how it was originally computed'
  )

  mesh.positions[index][1] += 0.2

  t.deepLooseEqual(
    mesh.normals[index],
    [ -0.5773502691896258, 0.5773502691896258, -0.5773502691896258 ],
    'New normal was averaged by its neighbors.'
  )

  t.end()
})

test('clone', t => {
  const mesh = quad.createBox(1, 1, 1)
  const cellToPositions = i => mesh.positions[i]
  t.equals(mesh.cells.length, 6, 'starts with 6 cells')
  t.equals(mesh.positions.length, 8, 'starts with 8 cells')
  // console.log(mesh)
  quad.clone(mesh, mesh.cells[0])
  t.equals(mesh.cells.length, 7, '1 cell was added')
  t.equals(mesh.positions.length, 12, '4 positions was added')
  t.deepLooseEqual(
    mesh.cells[0].map(cellToPositions),
    mesh.cells[6].map(cellToPositions),
    'The newly added cell was equal to the old one.'
  )
  t.end()
})

test('cloneCells', t => {
  const mesh = quad.createBox(1, 1, 1)
  const cellToPositions = i => mesh.positions[i]
  t.equals(mesh.cells.length, 6, 'starts with 6 cells')
  t.equals(mesh.positions.length, 8, 'starts with 8 cells')
  const twoConcurrentCells = mesh.cells.slice(1, 3)
  const clonedCells = quad.getNewGeometry(mesh, 'cells', () => {
    quad.cloneCells(mesh, twoConcurrentCells)
  })
  t.equals(mesh.cells.length, 6 + 2, '2 cells were added')
  t.equals(mesh.positions.length, 8 + 6, '6 positions were added')
  t.deepLooseEqual(
    twoConcurrentCells.map(cellToPositions),
    clonedCells.map(cellToPositions),
    'The newly added cells was equal to the old one.'
  )
  t.end()
})

test('computeCenterPositions', t => {
  const mesh = quad.createBox(1, 1, 1)
  const centers = quad.computeCenterPositions(mesh)
  t.deepLooseEqual(centers, [
    [0, 0.5, 0],
    [0, -0.5, 0],
    [-0.5, 0, 0],
    [0, 0, 0.5],
    [0.5, 0, 0],
    [0, 0, -0.5]
], 'The centers of the cells are calculated.')
  t.end()
})

test('computeCellCenter', t => {
  const mesh = quad.createBox(1, 1, 1)
  const topQuad = mesh.cells[0]
  const center = quad.computeCellCenter(mesh, topQuad)
  t.deepLooseEqual(center, [0, 0.5, 0])
  t.end()
})

test('computeNormals - connected', t => {
  const mesh = quad.createBox(1, 1, 1)
  delete mesh.normals
  quad.computeNormals(mesh)
  t.deepLooseEqual(mesh.normals, [
    [-0.5773502691896258, -0.5773502691896258, -0.5773502691896258],
    [-0.5773502691896258, -0.5773502691896258, 0.5773502691896258],
    [0.5773502691896258, -0.5773502691896258, 0.5773502691896258],
    [0.5773502691896258, -0.5773502691896258, -0.5773502691896258],
    [-0.5773502691896258, 0.5773502691896258, -0.5773502691896258],
    [-0.5773502691896258, 0.5773502691896258, 0.5773502691896258],
    [0.5773502691896258, 0.5773502691896258, 0.5773502691896258],
    [0.5773502691896258, 0.5773502691896258, -0.5773502691896258]
], 'Calculates normals that are the average of the surrounding cells')
  t.end()
})

test('computeNormals - disjoint', t => {
  const mesh = quad.createBoxDisjoint(1, 1, 1)
  delete mesh.normals
  quad.computeNormals(mesh)
  t.deepLooseEqual(mesh.normals, [
    [-1, 0, 0],
    [-1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, -1, 0],
    [0, -1, 0],
    [0, -1, 0],
    [0, 0, -1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, -1],
    [0, 1, 0],
    [0, 0, -1],
    [-1, 0, 0],
    [0, 1, 0],
    [-1, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, -1]
], 'Calculates normals that are unique to the disjoint cell.')
  t.end()
})

test('createBox', t => {
  const mesh = quad.createBox(1, 2, 3)
  t.deepLooseEqual(mesh, {
    positions: [
      [-0.5, -1, -1.5],
      [-0.5, -1, 1.5],
      [0.5, -1, 1.5],
      [0.5, -1, -1.5],
      [-0.5, 1, -1.5],
      [-0.5, 1, 1.5],
      [0.5, 1, 1.5],
      [0.5, 1, -1.5]],
    normals: [
      [-0.5773502691896258, -0.5773502691896258, -0.5773502691896258],
      [-0.5773502691896258, -0.5773502691896258, 0.5773502691896258],
      [0.5773502691896258, -0.5773502691896258, 0.5773502691896258],
      [0.5773502691896258, -0.5773502691896258, -0.5773502691896258],
      [-0.5773502691896258, 0.5773502691896258, -0.5773502691896258],
      [-0.5773502691896258, 0.5773502691896258, 0.5773502691896258],
      [0.5773502691896258, 0.5773502691896258, 0.5773502691896258],
      [0.5773502691896258, 0.5773502691896258, -0.5773502691896258]
  ],
    cells: [
      [4, 5, 6, 7],
      [3, 2, 1, 0],
      [0, 1, 5, 4],
      [5, 1, 2, 6],
      [7, 6, 2, 3],
      [0, 4, 7, 3]
  ]
  })
  t.end()
})

test.skip('createBoxDisjoint', t => {

})

test.skip('elementsFromQuads', t => {

})

test.skip('extrude', t => {

})

test.skip('extrudeDisjoint', t => {

})

test.skip('flip', t => {

})

test.skip('getCellNormal', t => {

})

test.skip('getCellFromEdge', t => {

})

test.skip('getCellsFromPositionIndex', t => {

})

test.skip('getCenter', t => {

})

test.skip('getLoop', t => {

})

test.skip('getNewGeometry', t => {

})

test.skip('inset', t => {

})

test.skip('insetDisjoint', t => {

})

test.skip('insetLoop', t => {

})

test.skip('mergePositions', t => {

})

test.skip('mirror', t => {

})

test.skip('subdivide', t => {

})

test.skip('splitHorizontal', t => {

})

test.skip('splitHorizontalDisjoint', t => {

})

test.skip('splitLoop', t => {

})

test.skip('splitVertical', t => {

})

test.skip('splitVerticalDisjoint', t => {

})

test.skip('updateNormals', t => {

})
