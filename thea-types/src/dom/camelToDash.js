/* http://stackoverflow.com/questions/8955533/javascript-jquery-split-camelcase-string-and-add-hyphen-rather-than-space */

export default s => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
