export default function removeNullishKey(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!obj[key]) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        removeNullishKey(obj[key]);
      }
    }
  }
}
