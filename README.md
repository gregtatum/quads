# `quads` - Geometry Tools

This package is a collection of quad geometry creation and manipulation tools. They can be used agnostic to any given library as they only operate on simple arrays and objects.  Please note that this package is an early release, and the APIs may stabilize over time. More rigorous testing is also in the works.

## Types

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### SimplicialComplex

This is a complicated math word that means an object with `{ positions, cells }`. The
word `mesh` is used for convenience in this module, and `normals` are included with
this object.

```javascript
// A single quad oriented facing up.
const mesh = {
  positions: [[-1, 0, -1], [-1, 0, 1], [1, 0, 1], [1, 0, -1]],
  normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
  cells: [[0, 1, 2, 3]]
}
```

Additional attributes may be added for one's own applications. For example:

```javascript
mesh.colors = mesh.positions.map(p => [0, p.y, 0])
```

Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `positions` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Position](#position)>** 
-   `cells` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Cell](#cell)>** 
-   `normals` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Normal](#normal)>** 

### Position

An array of 3 values representing a position [x, y, z].

Type: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

### Cell

In a simplicial complex, a cell is an array of of indices that refer to a position or
some other attribute like normals. Quads have 4 indices, and this module uses the
convention of `[a, b, c, d]` with clockwise winding order.

     b-------c
     |       |
     |       |
     a-------d

Type: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

### Normal

An array of 3 values, [x, y, z] representing a surface normal. A valid normal has a
length of 1. Normals are used for lighting calculation, and for knowing which way a
surface is oriented in space. Many operation rely on valid normals.

Type: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### averageNormalForPosition

Computes the average normal for a position given the connected cells.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `positionIndex` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `target` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)?** = \[]
-   `normalCache` **[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)?** A Map can be provided to cache intermediate normal computations.
-   `positionIndexToCells` **[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)?** A Map where positionIndex is mapped to its cell, used primarily internally.

Returns **Normal** target

### clone

Clones a cell. Returns the new cell.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 

Returns **Cell** cloned cell

### computeCellCenter

Computes the center of a single cell.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 

Returns **Position** center

### computeCenterPositions

Computes all of the centers of all the cells.

**Parameters**

-   `mesh` **SimplicialComplex** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Position>** centers

### computeNormals

Updates all of the normals for all the positions using
[#averageNormalForPosition](#averageNormalForPosition). If a normal doesn't exist,
then it is created.

**Parameters**

-   `mesh` **SimplicialComplex** 

Returns **SimplicialComplex** 

### createBox

Creates a quad box of the given dimensions. This box will render as a
smoothed out box, as the normals are averaged. This is typically used for a
starting place for subdividing or extrusion operations. If the
`optionalMesh` object is passed, then the box will be created inside of
that simplicial complex, otherwise a new mesh simplicial complex will be
generated.

**Parameters**

-   `x` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** = 1
-   `y` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** = 1
-   `z` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** = 1
-   `optionalMesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 

Returns **SimplicialComplex** 

### createBoxDisjoint

Creates a quad box of the given dimensions, but with non-joined positions.
This box renders as a flat shaded box. If the optionalMesh object is
passed, then the box will be created inside of that simplicial complex,
otherwise a new mesh simplicial complex will be generated.

**Parameters**

-   `x` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 1** 
-   `y` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 1** 
-   `z` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 1** 
-   `optionalMesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 

Returns **SimplicialComplex** 

### createQuad

Create a quad with options. If the optionalMesh object is passed, then the
quad will be created inside of that simplicial complex, otherwise a new
mesh simplicial complex will be generated. Both the mesh simplicial
complex and the created cell are returned in an object.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `mesh` **SimplicialComplex?= {}** 

**Examples**

_Usage:_

```javascript
const {mesh, cell} = createQuad({ positions: [[-1, 0, -1], [-1, 0, 1], [1, 0, 1], [1, 0, -1]] })
const {mesh, cell} = createQuad({ w: 1, h: 1 })
const {mesh, cell} = createQuad()
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** `{mesh, cell}`

### elementsFromQuads

Returns an elements array using the given `ArrayType`, which can be used by WebGL.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `drawMode` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?= 'triangles'** 
-   `ArrayType` **typeof?= Uint16Array** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** Elements using the given `ArrayType`, which can be used by WebGL.

### extrude

Given a target cell, first inset it, then move it along the cell's normal
outwards by a given distance.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `insetT` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Value ranged from `0` to `1`, defaults to `0`
-   `extrude` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Distance to extrude, defaults to `0`

### extrudeDisjoint

Given a target cell, first inset it, then move it along the cell's normal
outwards by a given distance, but all new geometry generated will not
share positions.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `insetT` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** = 0, ranged from `0` (the edge) to `1` (the center).
-   `extrude` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** = 0, the distance to extrude out.

### flip

Flip a cell's normal to point the other way. Returns the cell.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 

Returns **Cell** The cell

### getCellFromEdge

Find a cell given two position indices. Optionally provide a `previousCell`
that will not be matched against. Returns the first cell that matches.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `positionIndexA` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `positionIndexB` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `previousCell` **Cell?** Optional will not be matched against

Returns **Cell** 

### getCellNormal

Compute a cell's normal regardless of it's neighboring cells.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `target` **Normal?** **= \[]**

Returns **Normal** The target normal.

### getCellsFromPositionIndex

Given a position index, find any cells that include it.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `target` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Cell>?= \[]** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Cell>** The target cells.

### getCenter

Computes the center of a cell.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `target` **Position?= \[]** 

Returns **Position** center

### getLoop

Gets a loop of cells. Given a single cell, start walking in both
directions to select a loop. .

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `type` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** can either be `"cells"`, `"positions"`, or `"normals"`.
-   `opposite` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** will walk in the opposite direction, e.g. up and down, versus left and right

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array according to the `type`.

### getNewGeometry

Get all newly created geometry of the given type from whatever arbitrary
operations were done on the mesh. This assumes new geometry was created
and not destroyed.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `key` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `callback` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** 

**Examples**

_Usage:_

```javascript
const extrudedCells = quad.getNewGeometry(mesh, "cells", () => {
  quad.extrude(mesh, tipCell, 0.5, 3)
});
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

### inset

Inset a cell some value between `0` (its edges) and `1` (its center).

     b----------c
     |\   q1   /|
     | \      / |
     |  f----g  |
     |q0| tC |q2| tc = targetCell
     |  e----h  |
     | /      \ |
     |/   q3   \|
     a----------d

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`, defaults to `0`.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Cell>** cells `[q0, q1, q2, q3, targetCell]`

### insetDisjoint

Inset a cell some value between `0` (its edges) and `1` (its center), but
keep the new cells disjoint so they do not share any positions.

         bT----------cT
     bL   \    qT    /   cR
     |\    \        /    /|
     | \    fT----gT    / |
     |  fL  fM----gM  gR  |
     |qL|   |  tC |    |qR|   tC = targetCell
     |  eL  eM----hM  hR  |
     | /    eB----hB    \ |
     |/    /        \    \|
     aL   /    qB    \   dR
         aB----------dB

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** value between 0 - 1 (optional, default `0`)

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Cell>** cells `[qL, qT, qR, qB, targetCell]`.

### insetLoop

Given a cell, walk a loop and inset the loop, where 0 is the inset being on
the edge, and 1 the inset being in the enter. Setting opposite to true will
make the cell walk the loop in the opposite direction, e.g. up/down rather
than left/right.

    *----*----*----*----*----*----*----*----*----*
    |    |    |    |    |    |    |    |    |    |
    |    |    |<---|----|----|----|--->|    |    |
    |    |    |    |    |cell|    |    |    |    |
    |    |    |<---|----|----|----|--->|    |    |
    |    |    |    |    |    |    |    |    |    |
    *----*----*----*----*----*----*----*----*----*

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 0.5** Specifies where the split should be. Ranged from `0` to `1`
-   `opposite` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** will walk in the opposite direction, e.g. up and down, versus left and right

Returns **SimplicialComplex** 

### mergePositions

Combine all positions together and recompute the normals.

**Parameters**

-   `mesh` **SimplicialComplex** 

Returns **SimplicialComplex** 

### mirror

Clone all existing geometry, and mirror it about the given axis.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cells` **Cell** 
-   `axis` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** is either `0`, `1`, or `2`, which represents the `x`, `y`, and `z` axis respectively.

### splitHorizontal

Split a cell horizontally.

     b--------c
     |        |
     ab------cd
     |        |
     a--------d

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 0.5** Specifies where the split should be. Ranged from `0` to `1`
-   `targetCell`  

### splitHorizontalDisjoint

Split a cell horizontally into two new disconnected cells.

     b--------c
     |        |
     ab1----cd1
     ab2----cd2
     | target |
     a--------d

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 0.5** Specifies where the split should be. Ranged from `0` to `1`
-   `targetCell`  

### splitLoop

Given a cell, walk along the mesh in both directions and split the cell.

    *--------*--------*--------*--------*--------*--------*--------*
    |        |        |        |        |        |        |        |
    *        *<-------*--------*--cell--*--------*------->*        *
    |        |        |        |        |        |        |        |
    *--------*--------*--------*--------*--------*--------*--------*

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 0.5** Specifies where the split should be. Ranged from `0` to `1`
-   `opposite` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** will walk in the opposite direction, e.g. up and down, versus left and right

Returns **SimplicialComplex** 

### splitVertical

Split a cell horizontally.

     b---bc---c
     |   |    |
     |   |    |
     a---ad---d

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 0.5** Specifies where the split should be. Ranged from `0` to `1`, defaults to `0.5`.
-   `targetCell`  

### splitVerticalDisjoint

Split a cell horizontally into two new disconnected cells.

     b---bc1  bc2---c
     |     |  |     |
     |     |  |     |
     a---ad1  ad2---d

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?= 0.5** Specifies where the split should be. Ranged from `0` to `1`, defaults to `0.5`.
-   `targetCell`  

### subdivide

Use catmull clark subdivision to smooth out the geometry. All normals will
be recomputed. Under the hood this is a convenience function for the
module [gl-catmull-clark](https://www.npmjs.com/package/gl-catmull-clark).

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `subdivisions` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `positions` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Position>?= mesh.positions** 
-   `cells` **Cell?= mesh.cells** 

Returns **SimplicialComplex** 

### updateNormals

Updates all of the normals for all the positions using
[#averageNormalForPosition](#averageNormalForPosition). If a normal doesn't exist,
then it is created.

**Parameters**

-   `mesh` **SimplicialComplex** 
-   `cell` **Cell** 

Returns **SimplicialComplex** 

## Three

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### splitVertical

Split a cell horizontally.

     b---bc---c
     |   |    |
     |   |    |
     a---ad---d

**Parameters**

-   `$0` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** quad
    -   `$0.positions` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
    -   `$0.cells` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`
-   `_ref`  

### splitVerticalDisjoint

Split a cell horizontally into two new disconnected cells.

     b---bc1  bc2---c
     |     |  |     |
     |     |  |     |
     a---ad1  ad2---d

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`

### splitHorizontal

Split a cell horizontally.

     b--------c
     |        |
     ab------cd
     |        |
     a--------d

**Parameters**

-   `$0.positions` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `$0.cells` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`
-   `_ref2`  

### splitHorizontalDisjoint

Split a cell horizontally into two new disconnected cells.

     b--------c
     |        |
     ab1----cd1
     ab2----cd2
     | target |
     a--------d

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`

### inset

Inset a cell some value between `0` (its edges) and `1` (its center).

     b----------c
     |\   q1   /|
     | \      / |
     |  f----g  |
     |q0| tQ |q2|
     |  e----h  |
     | /      \ |
     |/   q3   \|
     a----------d

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** cells `[q0, q1, q2, q3, tC]` where `tC` is the `targetCell`.

### extrude

Given a target cell, first inset it, then move it along the cell's normal
outwards by a given distance.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `insetT` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `extrude` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

### averageNormalForPosition

Computes the average normal for a position given the connected cells.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `positionIndex` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `target` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)?** = \[]
-   `normalCache` **[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)?** = new Map() can be provided to cache intermediate normal computations.
-   `positionIndexToCells` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

Returns **any** the `targetNormal`

### insetDisjoint

Inset a cell some value between `0` (its edges) and `1` (its center), but
keep the new cells disjoint so they do not share any positions.

         bT----------cT
     bL   \    qT    /   cR
     |\    \        /    /|
     | \    fT----gT    / |
     |  fL  fM----gM  gR  |
     |qL|   |  tC |    |qR|   tC = targetCell
     |  eL  eM----hM  hR  |
     | /    eB----hB    \ |
     |/    /        \    \|
     aL   /    qB    \   dR
         aB----------dB

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** **=0**

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** cells `[q0, q1, q2, q3, tC]` where `tC` is the `targetCell`.

### extrudeDisjoint

Given a target cell, first inset it, then move it along the cell's normal
outwards by a given distance, but all new geometry generated will not
share positions.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `targetCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `insetT` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `extrude` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

### getCenter

Computes the center of a cell

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `target` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the targetPosition

### clone

Clones a cell. Returns the new cell.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** a new cell

### updateNormals

Updates all of the normals for all the positions using
[#averageNormalForPosition](#averageNormalForPosition). If a normal doesn't exist,
then it is created.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** mesh

### getCellNormal

Compute a cell's normal regardless of it's neighboring cells.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `target` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)?** **= \[]**

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** The target normal.

### getCellsFromPositionIndex

Given a position index, find any cells that include it.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `target` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** The target cells.

### flip

Flip a cell's normal to point the other way. Returns the cell.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** The cell

### createQuad

Create a quad with options. If the optionalMesh object is passed, then the
quad will be created inside of that simplicial complex, otherwise a new
mesh simplicial complex will be generated. Both the mesh simplicial
complex and the created cell are returned in an object.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

_Usage:_

```javascript
const {mesh, cell} = createQuad({ positions: [[-1, 0, -1], [-1, 0, 1], [1, 0, 1], [1, 0, -1]] })
const {mesh, cell} = createQuad({ w: 1, h: 1 })
const {mesh, cell} = createQuad()
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** `{mesh, cell}`

### createBoxDisjoint

Creates a quad box of the given dimensions, but with non-joined positions.
This box renders as a flat shaded box. If the optionalMesh object is
passed, then the box will be created inside of that simplicial complex,
otherwise a new mesh simplicial complex will be generated.

**Parameters**

-   `x` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `y` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `z` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `optionalMesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** a simplicial complex

### createBox

Creates a quad box of the given dimensions. This box will render as a
smoothed out box, as the normals are averaged. This is typically used for a
starting place for subdividing or extrusion operations. If the
`optionalMesh` object is passed, then the box will be created inside of
that simplicial complex, otherwise a new mesh simplicial complex will be
generated.

**Parameters**

-   `x` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `y` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `z` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `optionalMesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** a simplicial complex

### mergePositions

Combine all positions together and recompute the normals.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** mesh

### elementsFromQuads

Returns an elements array using the given `ArrayType`, which can be used by WebGL.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `drawMode` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `ArrayType` **typeof** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** Elements using the given `ArrayType`, which can be used by WebGL.

### computeNormals

Updates all of the normals for all the positions using
[#averageNormalForPosition](#averageNormalForPosition). If a normal doesn't exist,
then it is created.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The mesh

### splitLoop

Given a cell, walk along the mesh in both directions and split the cell.

    *--------*--------*--------*--------*--------*--------*--------*
    |        |        |        |        |        |        |        |
    *        *<-------*--------*--cell--*--------*------->*        *
    |        |        |        |        |        |        |        |
    *--------*--------*--------*--------*--------*--------*--------*

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`
-   `opposite` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** will walk in the opposite direction, e.g. up and down, versus left and right

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** mesh

### getCellFromEdge

Find a cell given two position indices. Optionally provide a `previousCell`
that will not be matched against. Returns the first cell that matches.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `positionIndexA` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `positionIndexB` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `previousCell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)?** Optional will not be matched against

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** Elements using the given `ArrayType`, which can be used by WebGL.

### getNewGeometry

Get all newly created geometry of the given type from whatever arbitrary
operations were done on the mesh. This assumes new geometry was created
and not destroyed.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `key` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `callback` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** 

**Examples**

_Usage:_

```javascript
const extrudedCells = quad.getNewGeometry(mesh, "cells", () => {
  quad.extrude(mesh, tipCell, 0.5, 3)
});
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

### subdivide

Use catmull clark subdivision to smooth out the geometry. All normals will
be recomputed. Under the hood this is a convenience function for the
module [gl-catmull-clark](https://www.npmjs.com/package/gl-catmull-clark).

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `subdivisions` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `positions` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `cells` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** mesh

### computeCenterPositions

Computes all of the centers of all the cells.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **any** A new array

### computeCellCenter

Computes the center of a single cell.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **any** A new array

### insetLoop

Given a cell, walk a loop and inset the loop, where 0 is the inset being on
the edge, and 1 the inset being in the enter. Setting opposite to true will
make the cell walk the loop in the opposite direction, e.g. up/down rather
than left/right.

    *----*----*----*----*----*----*----*----*----*
    |    |    |    |    |    |    |    |    |    |
    |    |    |<---|----|----|----|--->|    |    |
    |    |    |    |    |cell|    |    |    |    |
    |    |    |<---|----|----|----|--->|    |    |
    |    |    |    |    |    |    |    |    |    |
    *----*----*----*----*----*----*----*----*----*

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `t` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specifies where the split should be. Ranged from `0` to `1`
-   `opposite` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** will walk in the opposite direction, e.g. up and down, versus left and right

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** mesh

### getLoop

Gets a loop of cells. Given a single cell, start walking in both
directions to select a loop. .

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cell` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `type` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** can either be `"cells"`, `"positions"`, or `"normals"`.
-   `opposite` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** will walk in the opposite direction, e.g. up and down, versus left and right

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array according to the `type`.

### mirror

Clone all existing geometry, and mirror it about the given axis.

**Parameters**

-   `mesh` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `cells` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `axis` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** is either `0`, `1`, or `2`, which represents the `x`, `y`, and `z` axis respectively.
