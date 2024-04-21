import { DiffEditor } from "@monaco-editor/react";
import { useEffect, useState } from "react";

export default function DiffConstitutie({original, modified}) {
	const [originalValue, setOriginalValue] = useState("");
	const [modifiedValue, setModifiedValue] = useState("");

  useEffect(() => {
    fetch(`${original}.md`)
      .then((res) => res.text())
      .then((data) => setOriginalValue(data));
    fetch(`${modified}.md`)
      .then((res) => res.text())
      .then((data) => setModifiedValue(data));
  }, []);
  
	return (
    <DiffEditor
          height="50vh"
          original={originalValue}
          originalLanguage="markdown"
          modified={modifiedValue}
          modifiedLanguage="markdown"
          className="diff-editor"
          theme="vs-dark"
          options={{
            // You can optionally disable the resizing
            enableSplitViewResizing: true,
            renderSideBySide: true,
            renderLineHighlight: "line",
            automaticLayout: true,
            wordWrap: "on",
            readOnly: true,
          }}
    />
	);
}