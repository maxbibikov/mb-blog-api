exports.spacesToHyphens = (str) => {
  return str.replace(/\s/g, '-');
};

exports.generateSlug = (title, id) => {
  return `${this.spacesToHyphens(title).toLowerCase()}-${id}`;
};

exports.getIdFromSlug = (slug) => {
  // split slug to array of separate string values
  const splitSlugArr = slug.split('-');

  // get id from the end of the slug (last element in array)
  return splitSlugArr[splitSlugArr.length - 1];
};
