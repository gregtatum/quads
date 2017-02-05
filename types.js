/**
 * This is a complicated math word that means an object with `{ positions, cells }`. The
 * word `mesh` is used for convenience in this module, and `normals` are included with
 * this object.
 *
 * ```javascript
 * // A single quad oriented facing up.
 * const mesh = {
 *   positions: [[-1, 0, -1], [-1, 0, 1], [1, 0, 1], [1, 0, -1]],
 *   normals: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
 *   cells: [[0, 1, 2, 3]]
 * }
 * ```
 *
 * Additional attributes may be added for one's own applications. For example:
 *
 * ```javascript
 * mesh.colors = mesh.positions.map(p => [0, p.y, 0])
 * ```
 *
 * @property {Position[]} positions
 * @property {Cell[]} cells
 * @property {Normal[]} normals
 * @typedef {Object} SimplicialComplex
 */

/**
 * An array of 3 values representing a position [x, y, z].
 * @typedef {Array} Position
 */

/**
 * In a simplicial complex, a cell is an array of of indices that refer to a position or
 * some other attribute like normals. Quads have 4 indices, and this module uses the
 * convention of `[a, b, c, d]` with clockwise winding order.
 *
 * ```
 *  b-------c
 *  |       |
 *  |       |
 *  a-------d
 * ```
 *
 * @typedef {Array} Cell
 */

/**
 * An array of 3 values, [x, y, z] representing a surface normal. A valid normal has a
 * length of 1. Normals are used for lighting calculation, and for knowing which way a
 * surface is oriented in space. Many operation rely on valid normals.
 * @typedef {Array} Normal
 */
