const test = require('tape')
const quad = require('./quads')

test('createQuad', t => {
  test('createQuad with w h', t => {
    const {quads, cell} = quad.createQuad({w: 2, h: 6})
    t.plan(2)
    t.deepLooseEqual(quads, {
      positions: [[-1, 0, -3], [-1, 0, 3], [1, 0, 3], [1, 0, -3]],
      normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
      cells: [[0, 1, 2, 3]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [0, 1, 2, 3], 'The cell is also returned.')
  })

  test('createQuad with positions', t => {
    const {quads, cell} = quad.createQuad({positions: [[-1, 0, -3], [-1, 0, 3], [1, 0, 3], [1, 0, -3]]})
    t.plan(2)
    t.deepLooseEqual(quads, {
      positions: [[-1, 0, -3], [-1, 0, 3], [1, 0, 3], [1, 0, -3]],
      normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
      cells: [[0, 1, 2, 3]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [0, 1, 2, 3], 'The cell is also returned.')
  })

  test('createQuad with nothing', t => {
    const {quads, cell} = quad.createQuad()
    t.plan(2)
    t.deepLooseEqual(quads, {
      positions: [[-0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, 0.5], [0.5, 0, -0.5]],
      normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
      cells: [[0, 1, 2, 3]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [0, 1, 2, 3], 'The cell is also returned.')
  })

  test('createQuad with w h and facing a direction', t => {
    const {quads, cell} = quad.createQuad({w: 2, h: 6, facing: 'z-'})
    t.plan(2)
    t.deepLooseEqual(quads, {
      positions: [[1, -3, 0], [1, 3, 0], [-1, 3, 0], [-1, -3, 0]],
      normals: [[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]],
      cells: [[3, 2, 1, 0]]
    }, 'A quad simplicial complex is created')

    t.deepLooseEqual(cell, [3, 2, 1, 0], 'The cell is also returned.')
  })

  test('createQuad normal facing is correct', t => {
    t.plan(6)
    const xp = quad.createQuad({facing: 'x+'})
    t.deepLooseEqual(xp.quads.normals[0], [1, 0, 0], 'x+ points up')
    const xm = quad.createQuad({facing: 'x-'})
    t.deepLooseEqual(xm.quads.normals[0], [-1, 0, 0], 'x- points down')
    const yp = quad.createQuad({facing: 'y+'})
    t.deepLooseEqual(yp.quads.normals[0], [0, 1, 0], 'y+ points up')
    const ym = quad.createQuad({facing: 'y-'})
    t.deepLooseEqual(ym.quads.normals[0], [0, -1, 0], 'y- points down')
    const zp = quad.createQuad({facing: 'z+'})
    t.deepLooseEqual(zp.quads.normals[0], [0, 0, 1], 'z+ points up')
    const zm = quad.createQuad({facing: 'z-'})
    t.deepLooseEqual(zm.quads.normals[0], [0, 0, -1], 'z- points down')
  })
  t.end()
})
