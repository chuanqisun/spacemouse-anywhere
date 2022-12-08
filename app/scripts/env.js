/**
 * @type {Record<string, string>}
 */
export const define = {};

for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}
