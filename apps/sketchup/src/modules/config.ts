import { GamepadAxes } from "./device";

export const CONFIG_KEY_V1 = "config_key_v1";
export interface ConfigV1 {
  sensitivity: number; // [1..9]
  x: number; // 1 | -1
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}
export const DEFAULT_CONFIG: ConfigV1 = {
  sensitivity: 5,
  x: 1,
  y: 1,
  z: 1,
  rx: 1,
  ry: 1,
  rz: 1,
};

const BASE_MULTIPLIER = Object.freeze([2, 2, 2, 1, 1, 2]) as GamepadAxes;
const SENSITIVITY_SCALE = [0.075, 0.15, 0.25, 0.5, 0.8, 1.2, 1.8, 2.4, 5, 8] as const;

export function getMultiplier(config: ConfigV1) {
  return [
    BASE_MULTIPLIER[0] * SENSITIVITY_SCALE[config.sensitivity] * config.x,
    BASE_MULTIPLIER[1] * SENSITIVITY_SCALE[config.sensitivity] * config.y,
    BASE_MULTIPLIER[2] * SENSITIVITY_SCALE[config.sensitivity] * config.z,
    BASE_MULTIPLIER[3] * SENSITIVITY_SCALE[config.sensitivity] * config.rx,
    BASE_MULTIPLIER[4] * SENSITIVITY_SCALE[config.sensitivity] * config.ry,
    BASE_MULTIPLIER[5] * SENSITIVITY_SCALE[config.sensitivity] * config.rz,
  ] as const;
}

export async function getConfig() {
  return ((await chrome.storage.sync.get(CONFIG_KEY_V1))[CONFIG_KEY_V1] as ConfigV1) ?? DEFAULT_CONFIG;
}

export async function setConfig(config: ConfigV1) {
  await chrome.storage.sync.set({
    [CONFIG_KEY_V1]: config,
  });
}

export function onConfigChange(handler: (newValue: ConfigV1) => any) {
  chrome.storage.sync.onChanged.addListener((changes) => {
    for (let [key, { newValue }] of Object.entries(changes)) {
      if (key === CONFIG_KEY_V1) {
        handler(newValue);
      }
    }
  });
}
