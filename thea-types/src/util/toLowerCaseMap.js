import { entries, toMap } from './entries';
import map from './map';

const lc = ([k, v]) => [k.toLowerCase(), v];

export default x => toMap(map(entries(x), lc));
