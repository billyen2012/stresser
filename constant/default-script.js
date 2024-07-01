export const DEFAULT_SCRIPT = `import { sleep } from "k6";
import http from "k6/http";
import DataGenerator from "../data-generator/index.js";

const dataGenerator = new DataGenerator()

/**
 * @type {import('k6/options').Options}
 */
export const options = {
  vus: 100,
  duration: "30s",
  iterations: 5000,
};

export default function () {
  http.get("http://localhost:3000/api/ping");
  sleep(200 / 1000);
}
`;
