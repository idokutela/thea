import { set } from '../../util/functional';

export default state => key => el => state[key] !== el && set(key, el)(state);
