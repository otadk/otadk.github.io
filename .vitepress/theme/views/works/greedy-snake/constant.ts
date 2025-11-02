/**
 * @name Constants
 */
import * as THREE from 'three';

const DEFAULT_MAP_SIZE = 20; // Default map size

// ----- Materials -----
const RED_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0xff0000,
  wireframe: true,
  fog: true
});

const DEEP_RED_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0x880000,
  wireframe: true,
  fog: true
});

const GREEN_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0x00ff00,
  wireframe: true,
  fog: true
});

const DEEP_GREEN_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0x008800,
  wireframe: true,
  fog: true
});

const BLUE_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0x0000ff,
  wireframe: true,
  fog: true
});

const DEEP_BLUE_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0x000088,
  wireframe: true,
  fog: true
});

const PURPLE_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0x800080,
  wireframe: true,
  fog: true
});

const YELLOW_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0xffff00,
  wireframe: true,
  fog: true
});

const WHITE_MATERIAL = new THREE.MeshLambertMaterial({
  emissive: 0x888888,
  wireframe: true,
  fog: true
});

// ----- Node Status -----
export const NODE_EMPTY_STATUS = 0;
export const NODE_SNAKE_HEAD_STATUS = 1;
export const NODE_SNAKE_BODY_STATUS = 2;
export const NODE_FOOD_STATUS = 3;
export const NODE_BLOCK_STATUS = 4;
export const NODE_CROSS_BLOCK_BUFF_STATUS = 5;
export const NODE_FAST_BUFF_STATUS = 6;
export const NODE_SLOW_BUFF_STATUS = 7;
export const NODE_CUT_LENGTH_BUFF_STATUS = 8;

// Type for node status
export type NodeStatus =
  | typeof NODE_EMPTY_STATUS
  | typeof NODE_SNAKE_HEAD_STATUS
  | typeof NODE_SNAKE_BODY_STATUS
  | typeof NODE_FOOD_STATUS
  | typeof NODE_BLOCK_STATUS
  | typeof NODE_CROSS_BLOCK_BUFF_STATUS
  | typeof NODE_FAST_BUFF_STATUS
  | typeof NODE_SLOW_BUFF_STATUS
  | typeof NODE_CUT_LENGTH_BUFF_STATUS;

// Map node status to material
export const STATUS_MATERIAL_MAP: Record<NodeStatus, THREE.Material> = {
  [NODE_EMPTY_STATUS]: WHITE_MATERIAL,
  [NODE_SNAKE_HEAD_STATUS]: GREEN_MATERIAL,
  [NODE_SNAKE_BODY_STATUS]: DEEP_GREEN_MATERIAL,
  [NODE_FOOD_STATUS]: RED_MATERIAL,
  [NODE_BLOCK_STATUS]: PURPLE_MATERIAL,
  [NODE_CROSS_BLOCK_BUFF_STATUS]: DEEP_RED_MATERIAL,
  [NODE_FAST_BUFF_STATUS]: YELLOW_MATERIAL,
  [NODE_SLOW_BUFF_STATUS]: DEEP_BLUE_MATERIAL,
  [NODE_CUT_LENGTH_BUFF_STATUS]: BLUE_MATERIAL
};

// ----- Directions -----
export const UP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = 3;

// Direction offsets
export const DIRECTIONS = [0, 1, 0, -1, 0];

// Map keyboard keys to directions
export const KEY_DIRECTIONS_MAP: Record<string, number> = {
  ArrowLeft: LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
  a: LEFT,
  w: UP,
  d: RIGHT,
  s: DOWN
};

// ----- Speeds -----
export const MAX_SNAKE_SPEED = 40; // Max snake speed
export const BLOCK_SPEED = 60000; // Block spawn interval (1 minute)
export const BUFF_SPEED = 30000; // Buff spawn interval (30 seconds)

export { DEFAULT_MAP_SIZE };
