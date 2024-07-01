export const getDirtyValues = (updatedObj, initialObj) => {
  const map = {};

  for (let key in initialObj) {
    if (
      typeof updatedObj[key] === "object" &&
      typeof initialObj[key] === "object"
    ) {
      if (JSON.stringify(updatedObj[key]) !== JSON.stringify(initialObj[key])) {
        map[key] = updatedObj[key];
      }
    } else if (updatedObj[key] !== initialObj[key]) {
      map[key] = updatedObj[key];
    }
  }
  return map;
};
