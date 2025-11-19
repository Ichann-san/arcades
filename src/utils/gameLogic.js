// --- Constants & Game Logic Data ---
export const COLS = 16;
export const ROWS = 12;
export const BLOCK_SIZE = 40;
export const COLORS = [
  null,
  '#FF0D72', // T
  '#0DC2FF', // I
  '#0DFF72', // S
  '#F538FF', // Z
  '#FF8E0D', // L
  '#FFE138', // J
  '#3877FF', // O
];

export const SHAPES = [
  [],
  [[0,0],[1,0],[2,0],[1,1]], // T
  [[0,0],[1,0],[2,0],[3,0]], // I
  [[0,0],[1,0],[1,1],[2,1]], // S
  [[1,0],[2,0],[0,1],[1,1]], // Z
  [[0,0],[0,1],[1,1],[2,1]], // L
  [[2,0],[0,1],[1,1],[2,1]], // J
  [[0,0],[1,0],[0,1],[1,1]], // O
];

export function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

export function createPiece(type) {
  switch (type) {
    case 'T': return [[0,1,0], [1,1,1], [0,0,0]];
    case 'O': return [[2,2], [2,2]];
    case 'L': return [[0,0,3], [3,3,3], [0,0,0]];
    case 'J': return [[4,0,0], [4,4,4], [0,0,0]];
    case 'I': return [[0,5,0,0], [0,5,0,0], [0,5,0,0], [0,5,0,0]];
    case 'S': return [[0,6,6], [6,6,0], [0,0,0]];
    case 'Z': return [[7,7,0], [0,7,7], [0,0,0]];
    default: return [[0]];
  }
}