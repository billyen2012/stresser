import fs from "fs";

let version = null;
/**
 *
 * @returns {Promise<string>}
 */
export const getAppVersion = () => {
  return new Promise(async (resolve, reject) => {
    if (version) {
      return resolve(version);
    }
    fs.readFile(process.cwd() + "/package.json", (err, data) => {
      if (err) {
        return reject(err);
      }
      version = JSON.parse(data.toString("utf-8")).version;
      return resolve(version);
    });
  });
};
