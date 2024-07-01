import removeNullishKey from "./removeNullishKey";

/**
 * @param {(values:object)=>object} object
 */
export const formikValidate = (cb) => {
  return (values) => {
    const data = cb(values);
    removeNullishKey(data);
    return data;
  };
};
