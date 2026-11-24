// Shared shapes of the movement system (JSDoc only, nothing runs here).

/**
 * What a variant returns for each piece, every frame. Positions are in px from the stage center.
 * @typedef {object} PieceState
 * @property {number} x
 * @property {number} y
 * @property {number} rotation In degrees.
 * @property {number} scale
 * @property {number} opacity
 * @property {number} [z] Depth, 0 (far) to 1 (near).
 */

/**
 * Motion traits of a piece, generated from the global seed (traits.js).
 * @typedef {object} PieceTraits
 * @property {[number, number]} basePosition Start position, ratio from the stage center (-0.5 to 0.5).
 * @property {number} rotation Start rotation, in degrees.
 * @property {number} spin Rotation direction: 1 clockwise, -1 counterclockwise.
 * @property {number} direction Drift direction, in degrees.
 * @property {number} amplitude Wobble size, in px, before the global amplitude.
 * @property {number} frequency Wobble speed, in Hz.
 * @property {[number, number]} phase Wobble offset on each axis, in radians.
 * @property {number} z Depth, 0 (far) to 1 (near).
 */

/**
 * A floating piece, as variants receive it. Built by the runtime from floatingImgData.js.
 * @typedef {object} Piece
 * @property {number} index
 * @property {object} data Raw entry of floatingImgData.js.
 * @property {number} width Rendered size in px, at scale 1.
 * @property {number} height
 * @property {number} radius In px: half the mean side of the image.
 * @property {number} seed The piece's id. Combine it with the global seed.
 * @property {number} speed Speed of the piece, 1 = normal.
 * @property {number} scaleFloating Height while floating, ratio of the screen height.
 * @property {number} scaleOpen Size once opened, ratio of the screen.
 * @property {number} rotationSpeed Rotation speed, in degrees per second.
 * @property {number} amplitude Wobble size in px: traits.amplitude times the global amplitude.
 * @property {PieceTraits} traits
 * @property {number} activity 0 to 1, eased by the selection: multiply the piece's dt by it.
 * @property {boolean} held True while the piece is selected: leave its state untouched.
 */

/**
 * @typedef {object} Bounds
 * @property {number} width Stage size in px.
 * @property {number} height
 * @property {number} seed Global seed.
 */

/**
 * @typedef {object} Pointer
 * @property {number} x In px from the stage center.
 * @property {number} y
 * @property {boolean} active False when the cursor is out of the window.
 */

/**
 * One interchangeable movement. `update` must not allocate: mutate and return the same states.
 * @typedef {object} MovementStrategy
 * @property {string} name
 * @property {Record<string, number | boolean>} defaults Tunable params; the live copy is passed to init.
 * @property {Record<string, [number, number, number]>} [ranges] [min, max, step] of the sliders.
 * @property {(pieces: Piece[], bounds: Bounds, params: Record<string, number | boolean>) => void} init
 * @property {(dt: number, time: number, pointer?: Pointer) => PieceState[]} update
 * @property {(bounds: Bounds) => void} [resize]
 * @property {(g: CanvasRenderingContext2D) => void} [drawDebug] Extra overlay drawing (debug panel).
 */

export {};
