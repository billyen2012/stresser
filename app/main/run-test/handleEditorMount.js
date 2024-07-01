let isInitialized = false;

/**
 * @param {import('monaco-editor').editor} editor
 * @param {import('monaco-editor')} monaco
 * @param {{
 * path:string;
 * definition:string;
 * moduleName:string;
 * isNpmNodeModule:string;
 * }[]} typeDefinitions
 * @param {()=>void} handleSubmit formik.submit
 */
export const handleEditorMount = async (
  editor,
  monaco,
  typeDefinitions,
  onCtrlSCallback = () => {}
) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    noSemanticValidation: false,
    noSyntaxValidation: true,
    allowJs: true,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: true,
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => {
    editor.getAction("editor.action.formatDocument").run();
    onCtrlSCallback();
  });

  if (isInitialized) {
    return true;
  }

  typeDefinitions.forEach((e) => {
    const filePath = e.isNpmNodeModule
      ? `file:///node_modules/${e.path}`
      : `file:///${e.path}`;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      e.definition,
      filePath
    );
  });

  isInitialized = true;
};
