const vec3 = require('gl-vec3')
const catmullClark = require('gl-catmull-clark')

/**
 * Split a cell horizontally.
 *
 * ```
 *  b---bc---c
 *  |   |    |
 *  |   |    |
 *  a---ad---d
 * ```
 *
 * @param {Object} $0 quad
 * @param {Array} $0.positions
 * @param {Array} $0.cells
 * @param {Array} targetCell
 * @param {Number} t Specifies where the split should be. Ranged from `0` to `1`
 */
function splitVertical ({positions, cells}, targetCell, t = 0.5) {
  const [a, b, c, d] = targetCell
  const positionA = positions[a]
  const positionB = positions[b]
  const positionC = positions[c]
  const positionD = positions[d]
  const bcPosition = vec3.lerp([], positionB, positionC, t)
  const adPosition = vec3.lerp([], positionA, positionD, t)
  const bc = positions.length
  const ad = bc + 1
  positions[bc] = bcPosition
  positions[ad] = adPosition
  targetCell[2] = bc
  targetCell[3] = ad
  cells.push([ad, bc, c, d])
}

/**
 * Split a cell horizontally into two new disconnected cells.
 *
 * ```
 *  b---bc1  bc2---c
 *  |     |  |     |
 *  |     |  |     |
 *  a---ad1  ad2---d
 * ```
 *
 * @param {Object} quads
 * @param {Array} targetCell
 * @param {Number} t Specifies where the split should be. Ranged from `0` to `1`
 */
function splitVerticalDisjoint (quads, targetCell, t = 0.5) {
  const {positions, cells, normals} = quads
  const [a, b, c, d] = targetCell
  const bc1 = positions.length
  const ad1 = bc1 + 1
  const bc2 = bc1 + 2
  const ad2 = bc1 + 3

  // Add the positions
  const bcPosition = vec3.lerp([], positions[b], positions[c], t)
  const adPosition = vec3.lerp([], positions[a], positions[d], t)
  positions[bc1] = bcPosition
  positions[ad1] = adPosition
  positions[bc2] = bcPosition.slice()
  positions[ad2] = adPosition.slice()

  // Update the cells
  targetCell[2] = bc1
  targetCell[3] = ad1
  cells.push([ad2, bc2, c, d])

  // Normals - assume that disjoint splits all share the same normal.
  const normal = normals[a]
  normals[ad1] = normal.slice()
  normals[ad2] = normal.slice()
  normals[bc1] = normal.slice()
  normals[bc2] = normal.slice()
}

/**
 * Split a cell horizontally.
 *
 * ```
 *  b--------c
 *  |        |
 *  ab------cd
 *  |        |
 *  a--------d
 * ```
 *
 * @param {Array} $0.positions
 * @param {Array} $0.cells
 * @param {Array} targetCell
 * @param {Number} t Specifies where the split should be. Ranged from `0` to `1`
 */
function splitHorizontal ({positions, cells}, targetCell, t = 0.5) {
  const [a, b, c, d] = targetCell
  const positionA = positions[a]
  const positionB = positions[b]
  const positionC = positions[c]
  const positionD = positions[d]
  const abPosition = vec3.lerp([], positionB, positionA, t)
  const cdPosition = vec3.lerp([], positionC, positionD, t)
  const ab = positions.length
  const cd = ab + 1
  positions[ab] = abPosition
  positions[cd] = cdPosition
  targetCell[1] = ab
  targetCell[2] = cd
  cells.push([ab, b, c, cd])
}

/**
 * Split a cell horizontally into two new disconnected cells.
 *
 * ```
 *  b--------c
 *  |        |
 *  ab1----cd1
 *  ab2----cd2
 *  | target |
 *  a--------d
 * ```
 *
 * @param {Object} quads
 * @param {Array} targetCell
 * @param {Number} t Specifies where the split should be. Ranged from `0` to `1`
 */
function splitHorizontalDisjoint (quads, targetCell, t = 0.5) {
  const {positions, cells, normals} = quads
  const [a, b, c, d] = targetCell
  const ab1 = positions.length
  const cd1 = ab1 + 1
  const ab2 = ab1 + 2
  const cd2 = ab1 + 3

  // Positions
  const abPosition = vec3.lerp([], positions[a], positions[b], t)
  const cdPosition = vec3.lerp([], positions[d], positions[c], t)
  positions[ab1] = abPosition
  positions[cd1] = cdPosition
  positions[ab2] = abPosition.slice()
  positions[cd2] = cdPosition.slice()

  // Cells
  targetCell[0] = ab1
  targetCell[3] = cd1
  cells.push([a, ab2, cd2, d])

  // Normals - assume that disjoint splits all share the same normal.
  const normal = normals[a]
  normals[ab1] = normal.slice()
  normals[cd1] = normal.slice()
  normals[ab2] = normal.slice()
  normals[cd2] = normal.slice()
}

/**
 * Inset a cell some value between `0` (its edges) and `1` (its center).
 *
 * ```
 *  b----------c
 *  |\   q1   /|
 *  | \      / |
 *  |  f----g  |
 *  |q0| tQ |q2|
 *  |  e----h  |
 *  | /      \ |
 *  |/   q3   \|
 *  a----------d
 * ```
 *
 * @param {Object} quads
 * @param {Array} targetCell
 * @param {Number} t Specifies where the split should be. Ranged from `0` to `1`
 * @returns {Array} cells `[q0, q1, q2, q3, tC]` where `tC` is the `targetCell`.
 */
var inset = (() => {
  var center = [0, 0, 0]
  return function (quads, targetCell, t = 0) {
    const {positions, cells, normals} = quads
    const [a, b, c, d] = targetCell
    const e = positions.length
    const f = e + 1
    const g = f + 1
    const h = g + 1
    const positionA = positions[a]
    const positionB = positions[b]
    const positionC = positions[c]
    const positionD = positions[d]

    // Update positions
    center[0] = (positionA[0] + positionB[0] + positionC[0] + positionD[0]) / 4
    center[1] = (positionA[1] + positionB[1] + positionC[1] + positionD[1]) / 4
    center[2] = (positionA[2] + positionB[2] + positionC[2] + positionD[2]) / 4
    positions.push(vec3.lerp([], positionA, center, t))
    positions.push(vec3.lerp([], positionB, center, t))
    positions.push(vec3.lerp([], positionC, center, t))
    positions.push(vec3.lerp([], positionD, center, t))
    normals.push(normals[a].slice())
    normals.push(normals[b].slice())
    normals.push(normals[c].slice())
    normals.push(normals[d].slice())

    // Update cells
    targetCell[0] = e
    targetCell[1] = f
    targetCell[2] = g
    targetCell[3] = h
    const q0 = [a, b, f, e]
    const q1 = [f, b, c, g]
    const q2 = [h, g, c, d]
    const q3 = [a, e, h, d]
    cells.push(q0)
    cells.push(q1)
    cells.push(q2)
    cells.push(q3)
    return [q0, q1, q2, q3, targetCell]
  }
})()

/**
 * Given a target cell, first inset it, then move it along the cell's normal
 * outwards by a given distance.
 *
 * @param {Object} quads
 * @param {Array} targetCell
 * @param {Number} insetT
 * @param {Number} extrude
 */
var extrude = (() => {
  const toTranslate = []
  const translation = []
  const targetCellNormal = []
  return function (quads, targetCell, insetT = 0, extrude = 0) {
    const {positions, normals} = quads
    const ring = inset(quads, targetCell, insetT)
    const [qL, qT, qR, qB] = ring

    // Enumerate which positions to translate
    toTranslate[0] = targetCell[0]
    toTranslate[1] = targetCell[1]
    toTranslate[2] = targetCell[2]
    toTranslate[3] = targetCell[3]

    toTranslate[4] = qL[2]
    toTranslate[5] = qL[3]

    toTranslate[6] = qT[0]
    toTranslate[7] = qT[3]

    toTranslate[8] = qR[0]
    toTranslate[9] = qR[1]

    toTranslate[10] = qB[1]
    toTranslate[11] = qB[2]

    getCellNormal(quads, targetCell, targetCellNormal)
    vec3.scale(translation, targetCellNormal, extrude)

    for (let i = 0; i < toTranslate.length; i++) {
      const position = positions[toTranslate[i]]
      vec3.add(position, position, translation)
    }

    // Update all of the affected normals by averaging a position's neighboring
    // cell's normals. This will create some intermediate allocations, that will
    // then be GCed.
    const normalCache = new Map()
    normalCache.set(targetCell, targetCellNormal)
    const [a, b, c, d] = targetCell
    const e = positions.length - 4
    const f = positions.length - 3
    const g = positions.length - 2
    const h = positions.length - 1
    averageNormalForPosition(quads, a, normals[a], normalCache)
    averageNormalForPosition(quads, b, normals[b], normalCache)
    averageNormalForPosition(quads, c, normals[c], normalCache)
    averageNormalForPosition(quads, d, normals[d], normalCache)
    averageNormalForPosition(quads, e, normals[e], normalCache)
    averageNormalForPosition(quads, f, normals[f], normalCache)
    averageNormalForPosition(quads, g, normals[g], normalCache)
    averageNormalForPosition(quads, h, normals[h], normalCache)
  }
})()

function calculatePositionIndexToCells (quads) {
  const toCells = {}
  for (let i = 0; i < quads.cells.length; i++) {
    const cell = quads.cells[i]
    for (let j = 0; j < cell.length; j++) {
      const index = cell[j]
      let arr = toCells[index]
      if (!arr) {
        arr = []
        toCells[index] = arr
      }
      arr.push(cell)
    }
  }
  return toCells
}

/**
 * Computes the average normal for a position given the connected cells.
 *
 * @param {Object} quads
 * @param {Number} positionIndex
 * @param {Array?} target = []
 * @param {Map?} normalCache = new Map() can be provided to cache intermediate normal computations.
 * @param {Number} positionIndexToCells
 * @returns the `targetNormal`
 */
var averageNormalForPosition = (() => {
  const cellsCache = []

  return function averageNormalForPosition (quads, positionIndex, target = [], normalCache = new Map(), positionIndexToCells) {
    let cells
    if (positionIndexToCells) {
      cells = positionIndexToCells[positionIndex]
    } else {
      cells = getCellsFromPositionIndex(quads, positionIndex, cellsCache)
    }
    vec3.set(target, 0, 0, 0)

    // Add neighboring cells' normals
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      let normal
      if (normalCache) {
        normal = normalCache.get(cell)
      }
      if (!normal) {
        normal = getCellNormal(quads, cell, [])
        if (normalCache) {
          normalCache.set(normal)
        }
      }
      vec3.add(target, target, normal)
    }
    vec3.normalize(target, target)

    // Clean out the cellsCache.
    while (cellsCache.length) {
      cellsCache.pop()
    }
    return target
  }
})()

/**
 * Inset a cell some value between `0` (its edges) and `1` (its center), but
 * keep the new cells disjoint so they do not share any positions.
 *
 * ```
 *      bT----------cT
 *  bL   \    qT    /   cR
 *  |\    \        /    /|
 *  | \    fT----gT    / |
 *  |  fL  fM----gM  gR  |
 *  |qL|   |  tC |    |qR|   tC = targetCell
 *  |  eL  eM----hM  hR  |
 *  | /    eB----hB    \ |
 *  |/    /        \    \|
 *  aL   /    qB    \   dR
 *      aB----------dB
 * ```
 *
 * @param {Object} quads
 * @param {Array} targetCell
 * @param {Number?} t **=0**
 * @returns {Array} cells `[q0, q1, q2, q3, tC]` where `tC` is the `targetCell`.
 */
var insetDisjoint = (() => {
  var center = [0, 0, 0]
  return function (quads, targetCell, t = 0) {
    const {positions, cells, normals} = quads
    const [a, b, c, d] = targetCell
    const positionA = positions[a]
    const positionB = positions[b]
    const positionC = positions[c]
    const positionD = positions[d]

    // Calculate inset positions
    center[0] = (positionA[0] + positionB[0] + positionC[0] + positionD[0]) / 4
    center[1] = (positionA[1] + positionB[1] + positionC[1] + positionD[1]) / 4
    center[2] = (positionA[2] + positionB[2] + positionC[2] + positionD[2]) / 4
    const positionE = vec3.lerp([], positionA, center, t)
    const positionF = vec3.lerp([], positionB, center, t)
    const positionG = vec3.lerp([], positionC, center, t)
    const positionH = vec3.lerp([], positionD, center, t)

    // Assign indices
    const offset = positions.length
    const aB = offset
    const aL = a
    const bL = b
    const bT = offset + 1
    const cT = offset + 2
    const cR = c
    const dR = d
    const dB = offset + 3
    const eM = offset + 4
    const eB = offset + 5
    const eL = offset + 6
    const fM = offset + 7
    const fL = offset + 8
    const fT = offset + 9
    const gM = offset + 10
    const gT = offset + 11
    const gR = offset + 12
    const hM = offset + 13
    const hR = offset + 14
    const hB = offset + 15

    // Update cells
    targetCell[0] = eM
    targetCell[1] = fM
    targetCell[2] = gM
    targetCell[3] = hM
    const qL = [aL, bL, fL, eL]
    const qT = [fT, bT, cT, gT]
    const qR = [hR, gR, cR, dR]
    const qB = [aB, eB, hB, dB]
    cells.push(qL)
    cells.push(qT)
    cells.push(qR)
    cells.push(qB)

    // Update positions
    positions[aB] = positionA.slice()
    positions[aL] = positionA
    positions[bL] = positionB
    positions[bT] = positionB.slice()
    positions[cT] = positionC.slice()
    positions[cR] = positionC
    positions[dR] = positionD
    positions[dB] = positionD.slice()
    positions[eM] = positionE
    positions[eB] = positionE.slice()
    positions[eL] = positionE.slice()
    positions[fM] = positionF
    positions[fL] = positionF.slice()
    positions[fT] = positionF.slice()
    positions[gM] = positionG
    positions[gT] = positionG.slice()
    positions[gR] = positionG.slice()
    positions[hM] = positionH
    positions[hR] = positionH.slice()
    positions[hB] = positionH.slice()

    // Normals - assume that disjoint quads all share the same normal.
    const normal = normals[a]
    normals[aB] = normal.slice()
    normals[aL] = normals[a]
    normals[bL] = normals[b]
    normals[bT] = normal.slice()
    normals[cT] = normal.slice()
    normals[cR] = normals[c]
    normals[dR] = normals[d]
    normals[dB] = normal.slice()
    normals[eM] = normal.slice()
    normals[eB] = normal.slice()
    normals[eL] = normal.slice()
    normals[fM] = normal.slice()
    normals[fL] = normal.slice()
    normals[fT] = normal.slice()
    normals[gM] = normal.slice()
    normals[gT] = normal.slice()
    normals[gR] = normal.slice()
    normals[hM] = normal.slice()
    normals[hR] = normal.slice()
    normals[hB] = normal.slice()

    return [qL, qT, qR, qB]
  }
})()

/**
 * Given a target cell, first inset it, then move it along the cell's normal
 * outwards by a given distance, but all new geometry generated will not
 * share positions.
 *
 * @param {Object} quads
 * @param {Array} targetCell
 * @param {Number} insetT
 * @param {Number} extrude
 */
var extrudeDisjoint = (() => {
  const toTranslate = []
  const translation = []
  return function (quads, targetCell, insetT = 0, extrude = 0) {
    const {positions, normals} = quads
    const ring = insetDisjoint(quads, targetCell, insetT)
    const [qL, qT, qR, qB] = ring

    // Enumerate which positions to translate
    toTranslate[0] = targetCell[0]
    toTranslate[1] = targetCell[1]
    toTranslate[2] = targetCell[2]
    toTranslate[3] = targetCell[3]

    toTranslate[4] = qL[2]
    toTranslate[5] = qL[3]

    toTranslate[6] = qT[0]
    toTranslate[7] = qT[3]

    toTranslate[8] = qR[0]
    toTranslate[9] = qR[1]

    toTranslate[10] = qB[1]
    toTranslate[11] = qB[2]

    // Assume that disjoint quads all share the same normal.
    const targetCellNormal = normals[targetCell[0]]
    vec3.scale(translation, targetCellNormal, extrude)

    for (let i = 0; i < toTranslate.length; i++) {
      const position = positions[toTranslate[i]]
      vec3.add(position, position, translation)
    }

    // Calculate the normals for the translated rings.
    for (let i = 0; i < ring.length; i++) {
      updateNormals(quads, ring[i])
    }
  }
})()

/**
 * Computes the center of a cell
 *
 * @param {Object} quads
 * @param {Array} cell
 * @param {Array} target
 * @returns {Array} the targetPosition
 */
function getCenter (quads, cell, target = []) {
  const a = quads.positions[cell[0]]
  const b = quads.positions[cell[1]]
  const c = quads.positions[cell[2]]
  const d = quads.positions[cell[3]]
  target[0] = (a[0] + b[0] + c[0] + d[0]) * 0.25
  target[1] = (a[1] + b[1] + c[1] + d[1]) * 0.25
  target[2] = (a[2] + b[2] + c[2] + d[2]) * 0.25
  return target
}

/**
 * Clones a cell. Returns the new cell.
 *
 * @param {Object} quads
 * @param {Array} cell
 * @returns {Array} a new cell
 */
function clone (quads, cell) {
  const index = quads.positions.length
  const clonedCell = [index, index + 1, index + 2, index + 3]
  quads.cells.push(clonedCell)
  quads.positions.push(quads.positions[cell[0]].slice())
  quads.positions.push(quads.positions[cell[1]].slice())
  quads.positions.push(quads.positions[cell[2]].slice())
  quads.positions.push(quads.positions[cell[3]].slice())
  quads.normals.push(quads.normals[cell[0]].slice())
  quads.normals.push(quads.normals[cell[1]].slice())
  quads.normals.push(quads.normals[cell[2]].slice())
  quads.normals.push(quads.normals[cell[3]].slice())
  return clonedCell
}

/**
 * Updates all of the normals for all the positions using
 * {@link #averageNormalForPosition}. If a normal doesn't exist,
 * then it is created.
 *
 * @param {Object} quads
 * @param {Array} cell
 * @returns {Object} quads
 */
function updateNormals (quads, cell) {
  let normal = quads.normals[cell[0]]
  getCellNormal(quads, cell, normal)
  vec3.copy(quads.normals[cell[1]], normal)
  vec3.copy(quads.normals[cell[2]], normal)
  vec3.copy(quads.normals[cell[3]], normal)
}

var getCellNormal = (() => {
  const edgeA = []
  const edgeB = []
  /**
   * Compute a cell's normal regardless of it's neighboring cells.
   *
   * @param {Object} quads
   * @param {Array} cell
   * @param {Array?} target **= []**
   * @returns {Array} The target normal.
   */
  return function getCellNormal (quads, cell, target = []) {
    const positionA = quads.positions[cell[0]]
    const positionB = quads.positions[cell[1]]
    const positionC = quads.positions[cell[2]]
    vec3.subtract(edgeA, positionB, positionA)
    vec3.subtract(edgeB, positionC, positionB)
    vec3.normalize(target, vec3.cross(target, edgeA, edgeB))
    return target
  }
})()

/**
 * Given a position index, find any cells that include it.
 *
 * @param {Object} quads
 * @param {Number} index
 * @param {Array} target
 * @returns {Array} The target cells.
 */
function getCellsFromPositionIndex (quads, index, target = []) {
  for (let i = 0; i < quads.cells.length; i++) {
    const cell = quads.cells[i]
    if (cell.indexOf(index) >= 0) {
      target.push(cell)
    }
  }
  return target
}

/**
 * Flip a cell's normal to point the other way. Returns the cell.
 *
 * @param {Object} quads
 * @param {Array} cell
 * @returns {Array} The cell
 */
function flip (quads, cell) {
  const [a, b, c, d] = cell
  cell.reverse()
  const nA = quads.normals[a]
  const nB = quads.normals[b]
  const nC = quads.normals[c]
  const nD = quads.normals[d]
  vec3.scale(nA, nA, -1)
  vec3.scale(nB, nB, -1)
  vec3.scale(nC, nC, -1)
  vec3.scale(nD, nD, -1)
  return cell
}

/**
 * Create a quad with options. If the optionalQuads object is passed, then the
 * quad will be created inside of that simplicial complex, otherwise a new
 * quads simplicial complex will be generated. Both the quads simplicial
 * complex and the created cell are returned in an object.
 *
 * @example <caption>Usage:</caption>
 *
 * const {quads, cell} = createQuad({ positions: [[-1, 0, -1], [-1, 0, 1], [1, 0, 1], [1, 0, -1]] })
 * const {quads, cell} = createQuad({ w: 1, h: 1 })
 * const {quads, cell} = createQuad()
 *
 * @param {Object} options
 * @param {Object} quads
 * @returns {Object} `{quads, cell}`
 */
function createQuad (options, quads = {}) {
  if (!quads.positions) {
    quads.positions = []
  }
  if (!quads.normals) {
    quads.normals = []
  }
  if (!quads.cells) {
    quads.cells = []
  }
  const index = quads.positions.length
  let direction
  const cell = [
    index,
    index + 1,
    index + 2,
    index + 3
  ]
  quads.cells.push(cell)
  if (options && options.positions) {
    quads.positions.push(options.positions[0])
    quads.positions.push(options.positions[1])
    quads.positions.push(options.positions[2])
    quads.positions.push(options.positions[3])
  } else {
    let w, h
    if (options && options.w && options.h) {
      w = options.w / 2
      h = options.h / 2
    } else {
      w = 0.5
      h = 0.5
    }
    const facing = options && options.facing ? options.facing : 'y+'
    const axis = facing[0]
    direction = facing[1]
    switch (axis) {
      case 'x':
        quads.positions.push([0, -w, -h])
        quads.positions.push([0, w, -h])
        quads.positions.push([0, w, h])
        quads.positions.push([0, -w, h])
        break
      case 'y':
        quads.positions.push([-w, 0, -h])
        quads.positions.push([-w, 0, h])
        quads.positions.push([w, 0, h])
        quads.positions.push([w, 0, -h])
        break
      case 'z':
        quads.positions.push([w, -h, 0])
        quads.positions.push([w, h, 0])
        quads.positions.push([-w, h, 0])
        quads.positions.push([-w, -h, 0])
        break
    }
  }

  const normal = getCellNormal(quads, cell, [])
  quads.normals.push(normal)
  quads.normals.push(normal.slice())
  quads.normals.push(normal.slice())
  quads.normals.push(normal.slice())

  if (direction === '-') {
    flip(quads, cell)
  }

  return {quads, cell}
}

/**
 * Creates a quad box of the given dimensions, but with non-joined positions.
 * This box renders as a flat shaded box. If the optionalQuads object is
 * passed, then the box will be created inside of that simplicial complex,
 * otherwise a new quads simplicial complex will be generated.
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Object} optionalQuads
 * @returns {Object} a simplicial complex
 */
function createBoxDisjoint (x = 1, y = 1, z = 1, optionalQuads) {
  const {quads, cell} = createQuad({w: x, h: z}, optionalQuads)
  quads.positions.forEach(position => {
    position[1] -= y / 2
  })
  clone(quads, cell)
  flip(quads, quads.cells[1])
  extrudeDisjoint(quads, cell, 0, y)
  return quads
}

/**
 * Creates a quad box of the given dimensions. This box will render as a
 * smoothed out box, as the normals are averaged. This is typically used for a
 * starting place for subdividing or extrusion operations. If the
 * `optionalQuads` object is passed, then the box will be created inside of
 * that simplicial complex, otherwise a new quads simplicial complex will be
 * generated.
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Object} optionalQuads
 * @returns {Object} a simplicial complex
 */
function createBox (x, y, z, optionalQuads) {
  return mergePositions(createBoxDisjoint(x, y, z, optionalQuads))
}

/**
 * Combine all positions together and recompute the normals.
 *
 * @param {Object} quads
 * @returns {Object} the quads
 */
function mergePositions (quads) {
  const {positions, normals, cells} = quads
  // Go through each position.
  for (let aIndex = 0; aIndex < positions.length; aIndex++) {
    const a = positions[aIndex]

    // Compare this position to the rest of the position.
    for (let bIndex = aIndex + 1; bIndex < positions.length; bIndex++) {
      const b = positions[bIndex]

      // If the positions match, then remove "a" from positions.
      if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]) {
        // Update the cells to point to the bIndex.
        for (let k = 0; k < cells.length; k++) {
          const cell = cells[k]
          for (let l = 0; l < cell.length; l++) {
            const index = cell[l]
            if (index === aIndex) {
              cell[l] = bIndex - 1
            } else if (index > aIndex) {
              cell[l]--
            }
          }
        }

        // Remove the position and continue
        positions.splice(aIndex, 1)
        normals.splice(aIndex, 1)
        aIndex--
        break
      }
    }
  }

  const normalCache = new Map()
  for (let i = 0; i < positions.length; i++) {
    averageNormalForPosition(quads, i, normals[i], normalCache)
  }
  return quads
}
/**
 * Returns an elements array using the given `ArrayType`, which can be used by WebGL.
 *
 * @param {Object} quads
 * @param {String} drawMode
 * @param {typeof} ArrayType
 * @returns {Array} Elements using the given `ArrayType`, which can be used by WebGL.
 */
function elementsFromQuads (quads, drawMode = 'triangles', ArrayType = Uint16Array) {
  const countPerCell = drawMode === 'lines' ? 8 : 6
  const elements = new ArrayType(quads.cells.length * countPerCell)

  if (drawMode === 'lines') {
    // lines
    for (let i = 0; i < quads.cells.length; i++) {
      const [a, b, c, d] = quads.cells[i]
      const offset = i * countPerCell
      // Lines
      elements[offset + 0] = a
      elements[offset + 1] = b

      elements[offset + 2] = b
      elements[offset + 3] = c

      elements[offset + 4] = c
      elements[offset + 5] = d

      elements[offset + 6] = d
      elements[offset + 7] = a
    }
  } else {
    for (let i = 0; i < quads.cells.length; i++) {
      const offset = i * countPerCell
      const [a, b, c, d] = quads.cells[i]
      // Triangle:
      elements[offset + 0] = a
      elements[offset + 1] = b
      elements[offset + 2] = c

      elements[offset + 3] = c
      elements[offset + 4] = d
      elements[offset + 5] = a
    }
  }
  return elements
}

/**
 * Updates all of the normals for all the positions using
 * {@link #averageNormalForPosition}. If a normal doesn't exist,
 * then it is created.
 *
 * @param {Object} quads
 * @returns {Object} The quads
 */
function computeNormals (quads) {
  if (!quads.normals) {
    quads.normals = []
  }
  const normalCache = new Map()
  const positionIndexToCells = calculatePositionIndexToCells(quads)
  for (let i = 0; i < quads.positions.length; i++) {
    let normal = quads.normals[i]
    if (!normal) {
      normal = []
      quads.normals[i] = normal
    }
    averageNormalForPosition(quads, i, normal, normalCache, positionIndexToCells)
  }
  return quads
}

/**
 * Given a cell, walk along the quads in both directions and split the cell.
 *
 * ```
 * *--------*--------*--------*--------*--------*--------*--------*
 * |        |        |        |        |        |        |        |
 * *        *<-------*--------*--cell--*--------*------->*        *
 * |        |        |        |        |        |        |        |
 * *--------*--------*--------*--------*--------*--------*--------*
 * ```
 *
 * @param {Object} quads
 * @param {Array} cell
 * @param {Number} t Specifies where the split should be. Ranged from `0` to `1`
 * @param {Boolean} opposite - will walk in the opposite direction, e.g. up and down, versus left and right
 * @returns {Object} quads
 */
function splitLoop (quads, cell, t = 0.5, opposite) {
  let cellIndexA, cellIndexB, cellIndexC, cellIndexD
  if (opposite) {
    cellIndexA = 1
    cellIndexB = 2
    cellIndexC = 3
    cellIndexD = 0
  } else {
    cellIndexA = 0
    cellIndexB = 1
    cellIndexC = 2
    cellIndexD = 3
  }

  const positionIndexLB = cell[cellIndexA]
  const positionIndexLT = cell[cellIndexB]
  const positionIndexMT = quads.positions.length
  const positionIndexMB = quads.positions.length + 1
  const positionIndexRT = cell[cellIndexC]
  const positionIndexRB = cell[cellIndexD]

  const positionA = vec3.lerp([], quads.positions[positionIndexLT], quads.positions[positionIndexRT], t)
  const positionB = vec3.lerp([], quads.positions[positionIndexLB], quads.positions[positionIndexRB], t)
  const normalA = vec3.lerp([], quads.normals[positionIndexLT], quads.normals[positionIndexRT], t)
  const normalB = vec3.lerp([], quads.normals[positionIndexLB], quads.normals[positionIndexRB], t)
  quads.positions.push(positionA)
  quads.positions.push(positionB)
  quads.normals.push(vec3.normalize(normalA, normalA))
  quads.normals.push(vec3.normalize(normalB, normalB))

  // Split cells
  const cellL = cell
  const cellR = []
  quads.cells.push(cellR)
  cellL[cellIndexC] = positionIndexMT
  cellL[cellIndexD] = positionIndexMB
  cellR[cellIndexA] = positionIndexMB
  cellR[cellIndexB] = positionIndexMT
  cellR[cellIndexC] = positionIndexRT
  cellR[cellIndexD] = positionIndexRB

  // Split by walking up and down from the cell, and then merge the last points if they
  // meet.
  const newPositionIndex = _walkAndSplitLoop(quads, positionIndexLT, positionIndexMT, positionIndexRT, t)
  const didMerge = _mergePositionsIfEqual(quads, newPositionIndex, positionIndexMB)

  if (!didMerge) {
    _walkAndSplitLoop(quads, positionIndexRB, positionIndexMB, positionIndexLB, 1 - t)
  }

  return quads
}

function _mergePositionsIfEqual (quads, positionIndexA, positionIndexB) {
  const {positions, normals, cells} = quads
  if (positionIndexA >= 0 && positionIndexB >= 0) {
    const positionA = positions[positionIndexA]
    const positionB = positions[positionIndexB]
    if (
      positionA[0] === positionB[0] &&
      positionA[1] === positionB[1] &&
      positionA[2] === positionB[2]
    ) {
      const positionIndexSaved = positionIndexA < positionIndexB
        ? positionIndexA
        : positionIndexB
      const positionIndexDeleted = positionIndexA > positionIndexB
        ? positionIndexA
        : positionIndexB

      // Update the cells.
      for (let k = 0; k < cells.length; k++) {
        const cell = cells[k]
        for (let l = 0; l < cell.length; l++) {
          const positionIndex = cell[l]
          if (positionIndex === positionIndexDeleted) {
            cell[l] = positionIndexSaved
          } else if (positionIndex > positionIndexDeleted) {
            cell[l] = positionIndex - 1
          }
        }
      }

      // Remove the position and continue
      positions.splice(positionIndexDeleted, 1)
      normals.splice(positionIndexDeleted, 1)
    }
  }
}

/*
 * Utility function to split quads in a loop in a single direction, based off of the
 * previously split quad's positions. The cell orientation is based off the previously
 * split cell.
 *
 *  LT----MT---RT
 *   |    .     |
 *   |    .     | <- split this cell
 *   |    .     |
 *  LB----MB---RB
 *   |    |     |
 *   |    |     | <- previous cell
 *   |    |     |
 *   *----*-----*
 */
function _walkAndSplitLoop (quads, positionIndexLB, positionIndexMB, positionIndexRB, t) {
  let newPositionIndex
  while (true) {
    const cell = getCellFromEdge(quads, positionIndexLB, positionIndexRB)
    if (!cell) {
      break
    }
    const cellIndexA = cell.indexOf(positionIndexLB)
    const cellIndexD = cell.indexOf(positionIndexRB)
    const cellIndexB = (cellIndexA + 1) % 4
    const cellIndexC = (cellIndexD + 3) % 4

    const positionIndexLT = cell[cellIndexB]
    const positionIndexMT = quads.positions.length
    const positionIndexRT = cell[cellIndexC]

    // Create a new middle position at the opposite end
    const position = vec3.lerp([], quads.positions[positionIndexLT], quads.positions[positionIndexRT], t)
    const normal = vec3.lerp([], quads.normals[positionIndexLT], quads.normals[positionIndexRT], t)
    vec3.normalize(normal, normal)
    quads.positions.push(position)
    quads.normals.push(normal)

    // Construct the split cells.
    const cellL = cell
    const cellR = []
    quads.cells.push(cellR)

    cellL[cellIndexC] = positionIndexMT
    cellL[cellIndexD] = positionIndexMB

    cellR[cellIndexA] = positionIndexMB
    cellR[cellIndexB] = positionIndexMT
    cellR[cellIndexC] = positionIndexRT
    cellR[cellIndexD] = positionIndexRB

    // Modify the arguments to keep on walking.
    positionIndexLB = positionIndexLT
    positionIndexMB = positionIndexMT
    positionIndexRB = positionIndexRT

    newPositionIndex = positionIndexMT
  }
  return newPositionIndex
}

/**
 * Find a cell given two position indices. Optionally provide a `previousCell`
 * that will not be matched against. Returns the first cell that matches.
 *
 * @param {Object} quads
 * @param {Number} positionIndexA
 * @param {Number} positionIndexB
 * @param {Array?} previousCell - Optional will not be matched against
 * @returns {Array} Elements using the given `ArrayType`, which can be used by WebGL.
 */
function getCellFromEdge (quads, positionIndexA, positionIndexB, previousCell) {
  return quads.cells.find(cell => {
    if (cell === previousCell) {
      return false
    }
    const cellIndexA = cell.indexOf(positionIndexA)
    if (cellIndexA >= 0) {
      if (
        cell[(cellIndexA + 1) % 4] === positionIndexB ||
        cell[(cellIndexA + 3) % 4] === positionIndexB
      ) {
        return true
      }
    }
    return false
  })
}

/**
 * Get all newly created geometry of the given type from whatever arbitrary
 * operations were done on the quads. This assumes new geometry was created
 * and not destroyed.
 *
 * @example <caption>Usage:</caption>
 * const extrudedCells = quad.getNewGeometry(quads, "cells", () => {
 *   quad.extrude(quads, tipCell, 0.5, 3)
 * });
 *
 * @param {Object} quads
 * @param {Number} key
 * @param {Function} callback
 * @returns {Array}
 */
function getNewGeometry (quads, key, callback) {
  const geometry = quads[key]
  let start = geometry.length
  callback()
  return geometry.slice(start, geometry.length)
}

/**
 * Use catmull clark subdivision to smooth out the geometry. All normals will
 * be recomputed. Under the hood this is a convenience function for the
 * module [gl-catmull-clark](https://www.npmjs.com/package/gl-catmull-clark).
 *
 * @param {Object} quads
 * @param {Number} subdivisions
 * @param {Array} positions
 * @param {Array} cells
 * @returns {Object} quads
 */
function subdivide (quads, subdivisions, positions = quads.positions, cells = quads.cells) {
  const result = catmullClark(positions, cells, subdivisions, false)
  quads.positions = result.positions
  quads.cells = result.cells
  computeNormals(quads)
  return quads
}

/**
 * Computes all of the centers of all the cells.
 *
 * @param {Object} quads
 * @returns A new array
 */
function computeCenterPositions (quads) {
  return quads.cells.map(cell => computeCellCenter(quads, cell))
}

/**
 * Computes the center of a single cell.
 *
 * @param {Object} quads
 * @param {Number} $1.aI
 * @param {Number} $1.bI
 * @param {Number} $1.cI
 * @param {Number} $1.dI
 * @returns A new array
 */
function computeCellCenter (quads, [aI, bI, cI, dI]) {
  const { positions } = quads
  const a = positions[aI]
  const b = positions[bI]
  const c = positions[cI]
  const d = positions[dI]
  return [
    (a[0] + b[0] + c[0] + d[0]) * 0.25,
    (a[1] + b[1] + c[1] + d[1]) * 0.25,
    (a[2] + b[2] + c[2] + d[2]) * 0.25
  ]
}

/**
 * Given a cell, walk a loop and inset the loop, where 0 is the inset being on
 * the edge, and 1 the inset being in the enter. Setting opposite to true will
 * make the cell walk the loop in the opposite direction, e.g. up/down rather
 * than left/right.
 *
 * ```
 * *----*----*----*----*----*----*----*----*
 * |    |    |    |    |    |    |    |    |
 * |----|----|----|----|----|--->|    |    |
 * |    |    |    |    |    |    |    |    |
 * |----|----|----|----|----|--->|    |    |
 * |    |    |    |    |    |    |    |    |
 * *----*----*----*----*----*----*----*----*
 * ```
 *
 * @param {Object} quads
 * @param {Array} cell
 * @param {Number} t Specifies where the split should be. Ranged from `0` to `1`
 * @param {Boolean} opposite - will walk in the opposite direction, e.g. up and down, versus left and right
 * @returns {Object} quads
 */
function insetLoop (quads, cell, t = 0.5, opposite) {
  const tA = 1 - 0.5 * t
  const tB = 0.5 * t + (1 - tA) * t
  splitLoop(quads, cell, tA, opposite)
  splitLoop(quads, cell, tB, opposite)
  return quads
}

/**
 * Gets a loop of cells. Given a single cell, start walking in both
 * directions to select a loop. .
 *
 * @param {Object} quads
 * @param {Array} cell
 * @param {String} type - can either be `"cells"`, `"positions"`, or `"normals"`.
 * @param {Boolean} opposite - will walk in the opposite direction, e.g. up and down, versus left and right
 * @returns {Array} an array according to the `type`.
 */
function getLoop (quads, cell, type, opposite) {
  if (type === 'cells') {
    return _getLoopCells(quads, cell, opposite)
  }
  let positionIndexLB, positionIndexRB
  if (opposite) {
    positionIndexLB = cell[1]
    positionIndexRB = cell[2]
  } else {
    positionIndexLB = cell[0]
    positionIndexRB = cell[1]
  }

  return [
    ..._getLoopOneDirection(quads, cell, type, positionIndexLB, positionIndexRB),
    ...cell.map(i => quads[type][i]),
    ..._getLoopOneDirection(quads, cell, type, positionIndexRB, positionIndexLB).reverse()
  ]
}

function _getLoopCells (quads, cell, opposite) {
  let positionIndexLB, positionIndexRB
  if (opposite) {
    positionIndexLB = cell[1]
    positionIndexRB = cell[2]
  } else {
    positionIndexLB = cell[0]
    positionIndexRB = cell[1]
  }

  return [
    ..._getLoopCellsOneDirection(quads, cell, positionIndexLB, positionIndexRB),
    cell,
    ..._getLoopCellsOneDirection(quads, cell, positionIndexRB, positionIndexLB).reverse()
  ]
}

function _getLoopCellsOneDirection (quads, cell, indexA, indexB) {
  const loop = []
  let positionIndexLB = indexA
  let positionIndexRB = indexB
  let neighborCell = cell
  while (true) {
    neighborCell = getCellFromEdge(quads, positionIndexLB, positionIndexRB, neighborCell)
    if (!neighborCell || neighborCell === cell) {
      break
    }

    loop.push(neighborCell)

    const cellIndexA = neighborCell.indexOf(positionIndexLB)
    const cellIndexD = neighborCell.indexOf(positionIndexRB)
    const cellIndexB = (cellIndexA + 1) % 4
    const cellIndexC = (cellIndexD + 3) % 4

    // Modify the arguments to keep on walking.
    positionIndexLB = neighborCell[cellIndexB]
    positionIndexRB = neighborCell[cellIndexC]
  }
  return loop
}

function _getLoopOneDirection (quads, cell, type, indexA, indexB) {
  const loop = []
  let positionIndexLB = indexA
  let positionIndexRB = indexB
  let neighborCell = cell
  while (true) {
    neighborCell = getCellFromEdge(quads, positionIndexLB, positionIndexRB, neighborCell)
    if (!neighborCell || neighborCell === cell) {
      break
    }

    const cellIndexA = neighborCell.indexOf(positionIndexLB)
    const cellIndexD = neighborCell.indexOf(positionIndexRB)
    const cellIndexB = (cellIndexA + 1) % 4
    const cellIndexC = (cellIndexD + 3) % 4

    loop.push(quads[type][neighborCell[cellIndexB]])
    loop.push(quads[type][neighborCell[cellIndexC]])

    // Modify the arguments to keep on walking.
    positionIndexLB = neighborCell[cellIndexB]
    positionIndexRB = neighborCell[cellIndexC]
  }
  return loop
}

/**
 * Clone all existing geometry, and mirror it about the given axis.
 *
 * @param {Object} quads
 * @param {Array} cells
 * @param {Number} axis - is either `0`, `1`, or `2`, which represents the `x`, `y`, and `z` axis respectively.
 */
function mirror (quads, cells, axis) {
  const mirrorMap = {}

  cells.forEach(cell => {
    const mirrorCell = cell.map(positionIndex => {
      let mirrorIndex = mirrorMap[positionIndex]
      if (mirrorIndex === undefined) {
        mirrorIndex = quads.positions.length
        mirrorMap[positionIndex] = mirrorIndex
        const position = quads.positions[positionIndex]
        const normal = quads.normals[positionIndex]
        const mirrorPosition = position.slice()
        const mirrorNormal = normal.slice()
        mirrorPosition[axis] *= -1
        mirrorNormal[axis] *= -1
        quads.positions.push(mirrorPosition)
        quads.normals.push(mirrorNormal)
      }
      return mirrorIndex
    })
    mirrorCell.reverse()
    quads.cells.push(mirrorCell)
  })

  return quads
}

module.exports = {
  averageNormalForPosition,
  clone,
  computeCenterPositions,
  computeCellCenter,
  computeNormals,
  createBox,
  createBoxDisjoint,
  createQuad,
  elementsFromQuads,
  extrude,
  extrudeDisjoint,
  flip,
  getCellNormal,
  getCellFromEdge,
  getCellsFromPositionIndex,
  getCenter,
  getLoop,
  getNewGeometry,
  inset,
  insetDisjoint,
  insetLoop,
  mergePositions,
  mirror,
  subdivide,
  splitHorizontal,
  splitHorizontalDisjoint,
  splitLoop,
  splitVertical,
  splitVerticalDisjoint,
  updateNormals
}
