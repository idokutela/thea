import reduce from './reduce';
import map from './map';

export const keys = o => Object.keys(o);
export const entries = o => map(keys(o), k => [k, o[k]]);
export const set = (o, k, v) => Object.assign(o, { [k]: v });
export const toMap = allEntries => reduce(allEntries, (r, [k, v]) => r.set(k, v), new Map());
