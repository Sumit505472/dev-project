import React, { useState } from "react";
import CodeEditor from "../components/codeeditor";
import axios from "axios";

function Compiler() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("// Write your code here");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunCode = async () => {
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const payload =  {
        code,
        language,
        input,
      };

      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/run`, payload);

      if (res.data.error) {
        setOutput(res.data.error);
      } else {
        setOutput(res.data.output);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Online Compiler</h1>

        {/* Language Selector */}
        <div className="mb-4">
          <label className="mr-2 font-semibold">Language:</label>
          <select
            className="border px-2 py-1 rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
        </div>

        {/* Code Editor */}
        <CodeEditor language={language} code={code} setCode={setCode} />

        {/* Input Box */}
        <textarea
          className="w-full border rounded p-2 mt-4"
          rows={3}
          placeholder="Input (optional)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Run Button */}
        <div className="mt-4">
          <button
            onClick={handleRunCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Running..." : "Run Code"}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Output:</h2>
            <pre className="bg-gray-900 text-white p-4 rounded whitespace-pre-wrap">{output}</pre>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error:</h2>
            <pre className="bg-red-100 text-red-800 p-4 rounded whitespace-pre-wrap">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Compiler;
