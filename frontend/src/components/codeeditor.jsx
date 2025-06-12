import Editor from '@monaco-editor/react';

export default function CodeEditor({ language, code, setCode }) {
  return (
    <div className="border rounded mb-2 ">
      <Editor
        height="600px"
        language={language === 'cpp' ? 'cpp' : language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
      />
    </div>
  );
}
