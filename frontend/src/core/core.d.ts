/* tslint:disable */
/* eslint-disable */
/**
 * @param {Settings} settings
 * @returns {Uint8Array}
 */
export function generate(settings: Settings): Uint8Array;
/**
 */
export class Settings {
  free(): void;
  /**
   * @param {number} width
   * @param {number} height
   * @param {string} background_color
   * @param {string} ferrises
   * @param {number} ferris_size
   * @param {number} ferris_offset
   * @param {boolean} show_circles
   * @param {number} circle_radius
   * @param {string} circle_color
   * @param {boolean} use_crosses
   */
  constructor(
    width: number,
    height: number,
    background_color: string,
    ferrises: string,
    ferris_size: number,
    ferris_offset: number,
    show_circles: boolean,
    circle_radius: number,
    circle_color: string,
    use_crosses: boolean
  );
}

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_settings_free: (a: number) => void;
  readonly settings_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number
  ) => number;
  readonly generate: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {SyncInitInput} module
 *
 * @returns {InitOutput}
 */
export function initSync(module: SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function init(
  module_or_path?: InitInput | Promise<InitInput>
): Promise<InitOutput>;
