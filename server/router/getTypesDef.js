import fs from "fs";
import { TYPE_DEFINITION_VERSION } from "@/constant/type-definition-version";

const generateTypeDef = (
  typeDefinitions,
  {
    moduleName,
    moduleRelativePath,
    isTraversing = false,
    // internal use prop
    fileDir = "",
    includeSubDir = [],
    isNpmNodeModule = false,
  }
) => {
  const basePath = isTraversing
    ? moduleRelativePath
    : process.cwd() + moduleRelativePath;

  const dirs = fs.readdirSync(basePath);

  for (let file of dirs) {
    const stat = fs.statSync(basePath + "/" + file);
    if (stat.isDirectory()) {
      if (includeSubDir.length > 0 && includeSubDir.includes(file) == false) {
        continue;
      }
      generateTypeDef(typeDefinitions, {
        moduleRelativePath: basePath + "/" + file,
        moduleName,
        isTraversing: true,
        fileDir: fileDir + "/" + file,
        includeSubDir,
      });
      continue;
    }
    if (stat.isFile() && file.endsWith(".d.ts")) {
      const buffer = fs.readFileSync(basePath + "/" + file);
      typeDefinitions.push({
        path: moduleName + fileDir + "/" + file, // note
        moduleName,
        definition: buffer.toString("utf-8"),
        isNpmNodeModule,
      });
      continue;
    }
  }
};

let typeDefinitions = null;
/**@type {import('@billyen2012/next-api-router').NextApiProcessCallback} */
export const getTypesDef = (req, res) => {
  if (req.params.version !== TYPE_DEFINITION_VERSION) {
    res.status(400);
    return {
      code: 400,
      message: "current version is " + TYPE_DEFINITION_VERSION,
    };
  }

  if (typeDefinitions) {
    return typeDefinitions;
  }

  typeDefinitions = [];

  [
    {
      moduleName: "@types/k6",
      moduleRelativePath: "/node_modules/@types/k6",
      isNpmNodeModule: true,
    },
    {
      moduleName: "data-generator",
      moduleRelativePath: "/data-generator",
      isNpmNodeModule: false,
    },
  ].forEach((options) => {
    generateTypeDef(typeDefinitions, options);
  });

  res.headers.set("cache-control", "public, max-age=604800, immutable");
  return typeDefinitions;
};
