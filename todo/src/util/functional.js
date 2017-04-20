/* eslint-disable no-plusplus, no-param-reassign */
export function compose(...fs) {
  return (x) => {
    let rval = x;
    for (let i = fs.length - 1; i >= 0; i--) {
      rval = fs[i](rval);
    }
    return rval;
  };
}

export const get = key => x => x[key];

export const set = (key, value) => x => Object.assign(x, { [key]: value });

export const unset = key => (x) => { delete x[key]; return x; };
