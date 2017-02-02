# `quads` - Geometry Tools

This package is a collection of quad geometry creation and manipulation tools. They can be used agnostic to any given library as they only operate on simple arrays and objects. The basic data structure is a simplicial complex of the form.

Please note that this package is an early release, and the APIs may stabilize over time. I also plan on adding more rigorous testing support.

```javascript
const quads = {
  positions: [[-1, 0, -1], [-1, 0, 1], [1, 0, 1], [1, 0, -1]],
  normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
  cells: [[0, 1, 2, 3]]
}
```

This would define a single quad facing up on the Y axis of width 2, centered about the Y axis. The API mutates this simpicial complex with most operations that are performed. It generally attempts to keep the normals intact, but the occasional operation requires normals to be re-computed.

## API

### averageNormalForPosition(quads, positionIndex, targetNormal = [], normalCache = new Map())

Computes the average normal for a position given the connected cells. Returns the targetNormal. A normalCache can be provided to cache intermediate normal computations. One is provided by default if none is passed in.

### clone(quads, cell)

Clones a cell. Returns the new cell.

### computeCenterPositions(quads)

Computes all of the centers of all the cells. Returns a new array.

### computeCellCenter(quads, cell)

Computes the center of a cell. Returns a new array.

### computeNormals(quads)

Updates all of the normals for all the positions using `averageNormalForPosition`. If a normal doesn't exist, then it is created. Returns the quads.

### createBox(x, y, z, quads = {})

Creates a quad box of the given dimensions. This box will render as a smoothed out box, as the normals are averaged. This is typically used for a starting place for subdividing or extrusion operations. If the optionalQuads object is passed, then the box will be created inside of that simplicial complex, otherwise a new quads simplicial complex will be generated. Returns a simplicial complex.

### createBoxDisjoint(x, y, z, quads = {})

Creates a quad box of the given dimensions, but with non-joined positions. This box renders as a flat shaded box. If the optionalQuads object is passed, then the box will be created inside of that simplicial complex, otherwise a new quads simplicial complex will be generated. Returns a simplicial complex.

### createQuad(options, quads = {})

Create a quad with options. If the optionalQuads object is passed, then the quad will be created inside of that simplicial complex, otherwise a new quads simplicial complex will be generated. Both the quads simplicial complex and the created cell are returned in an object.

Options:
```javascript
const {quads, cell} = createQuad({ positions: [[-1, 0, -1], [-1, 0, 1], [1, 0, 1], [1, 0, -1]] })
const {quads, cell} = createQuad({ w: 1, h: 1 })
const {quads, cell} = createQuad()
```

### elementsFromQuads(quads, drawMode = 'triangles', ArrayType = Uint16Array)

Returns an elements array using the given ArrayType, which can be used by WebGL.

### extrude(quads, targetCell, insetT = 0, extrude = 0)

Given a target cell, first inset it, then move it along the cell's normal outwards by a given distance.

### extrudeDisjoint(quads, targetCell, insetT = 0, extrude = 0)

Given a target cell, first inset it, then move it along the cell's normal outwards by a given distance, but all new geometry generated will not share positions.

### flip(quads, cell)

Flip a cell's normal to point the other way. Returns the cell.

### getCellNormal(quads, cell, targetNormal = [])

Compute a cell's normal regardless of it's neighboring cells. Returns the target normal.

### getCellFromEdge(quads, positionIndexA, positionIndexB, previousCell)

Find a cell given two position indices. Optionally provide a `previousCell` that will not be matched against. Returns the first cell that matches.

### getCellsFromPositionIndex(quads, positionIndex, targetCells = [])

Given a position index, find any cells that include it. Returns the target cells.

### getCenter(quads, cell, targetPosition = [])

Computes the center of a cell, returns the targetPosition.

### getLoop(quads, cell, type, opposite = false)

Gets a loop of cells. Given a single cell, start walking in both directions to select a loop. `type` can either be "cells", "positions", or "normals". Opposite will walk in the opposite direction, e.g. up and down, versus left and right. Returns an array of the given type.

### getNewGeometry(quads, key, callback)

Get all newly created geometry of the given type from whatever arbitrary operations were done on the quads. This assumes new geometry was created and not destroyed.

Usage:
```
const extrudedCells = quad.getNewGeometry(quads, "cells", () => {
  quad.extrude(quads, tipCell, 0.5, 3)
})
```

### inset(quads, targetCell, t = 0)

Inset a cell some value between 0 (its edges) and 1 (its center).

```
  *----------*
  |\   q1   /|
  | \      / |
  |  f----g  |
  |q0| tC |q2|
  |  e----h  |
  | /      \ |
  |/   q3   \|
  *----------*
```

Returns cells `[q0, q1, q2, q3, tC]` where tC is the targetCell.

### insetDisjoint()

Inset a cell some value between 0 (its edges) and 1 (its center), but keep the new cells
disjoint so they do not share any positions.

```
      *------------*
  *    \    qT    /    *
  |\    \        /    /|
  | \    *------*    / |
  |  *   *------*   *  |
  |qL|   |  tC  |   |qR|
  |  *   *------*   *  |
  | /    *------*    \ |
  |/    /        \    \|
  *    /    qB    \    *
      *------------*
```

Returns cells `[q0, q1, q2, q3, tC]` where tC is the targetCell.

### insetLoop(quads, cell, t = 0.5, opposite = false)

Given a cell, walk a loop and inset the loop, where 0 is the inset being on the edge, and 1 the inset being in the enter. Setting opposite to true will make the cell walk the loop in the opposite direction, e.g. up/down rather than left/right.

```
*----*----*----*----*----*----*----*----*
|    |    |    |    |    |    |    |    |
|----|----|----|----|----|--->|    |    |
|    |    |    |    |    |    |    |    |
|----|----|----|----|----|--->|    |    |
|    |    |    |    |    |    |    |    |
*----*----*----*----*----*----*----*----*
```

### mergePositions(quads)

Combine all positions together and recompute the normals. Returns the quads.

### mirror(quads, cells, axis)

Clone all existing geometry, and mirror it about the given axis, where the axis is either 0, 1, or 2, which represents the x, y, and z axis respectively.

### subdivide(quads, subdivisions)

Use catmull clark subdivision to smooth out the geometry. All normals will be recomputed. Under the hood this is a convenience function for the module [gl-catmull-clark](https://www.npmjs.com/package/gl-catmull-clark).

### splitHorizontal(quads, targetCell, t = 0.5)

Split a cell horizontally, where `t` is a value ranged 0 to 1 representing where the split should be.

```
*--------*
|        |
*--------*
|        |
*--------*
```

### splitHorizontalDisjoint(quads, targetCell, t = 0.5)

Split a cell horizontally, where `t` is a value ranged 0 to 1 representing where the split should be. The two new cells will not be connected.

```
*--------*
|        |
*--------*
*--------*
|        |
*--------*
```

### splitLoop(quads, cell, t = 0.5, opposite = false)

Given a cell, walk along the quads in both directions and split the cell where `t` is a value ranged 0 to 1 representing where the split should be.

```
*--------*--------*--------*--------*--------*--------*--------*
|        |        |        |        |        |        |        |
*        *<-------*--------*--cell--*--------*------->*        *
|        |        |        |        |        |        |        |
*--------*--------*--------*--------*--------*--------*--------*
```

Returns the quads.

### splitVertical(quads, targetCell, t = 0.5)

Split a cell horizontally, where `t` is a value ranged 0 to 1 representing where the split should be.

```
*----*----*
|    |    |
|    |    |
|    |    |
*----*----*
```

### splitVerticalDisjoint(quads, targetCell, t = 0.5)

Split a cell horizontally, where `t` is a value ranged 0 to 1 representing where the split should be. The two new cells will not be connected.

```
*----**----*
|    ||    |
|    ||    |
|    ||    |
*----*-----*
```

### updateNormals(quads, cell)

Updates all of the normals of a cell to be that of the computed normal of the cell.
