import React, { useState, useEffect } from "react";
import CodeEditor from "../components/codeeditor"; 
import axios from "axios";

function Compiler() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to get initial code based on language
  const getInitialCode = (lang) => {
    switch (lang) {
      case "cpp":
        return `#include <iostream>\n\nint main() {\n    // Write your C++ code here\n    std::cout << "Hello from C++";\n    return 0;\n}`;
      case "python":
        return `# Write your Python code here\nprint("Hello from Python")`;
      case "java":
        return `public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n        System.out.println("Hello from Java");\n    }\n}`;
      case "c":
        return `#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    printf("Hello from C\\n");\n    return 0;\n}`;
      default:
        return "// Write your code here"; 
    }
  };

  // Effect to update code when language changes
  useEffect(() => {
    setCode(getInitialCode(language));
  }, [language]); // Rerun when language state changes


  const handleRunCode = async () => {
    setLoading(true);
    setError("");
    setOutput("");
  
    try {
      const payload = {
        code,
        language,
        input,
      };
  
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, payload);
  
      if (res.data.error || res.data.stderr) {
        setOutput("");
        const fullErrorMessage = res.data.error || res.data.stderr || "Unknown execution error.";
        setError(fullErrorMessage);
      } else {
        setError("");
        setOutput(res.data.output);
      }
  
    } catch (err) {
      // ✅ Handle backend TLE or other errors returned with 400
      setOutput("");
      let errorMessage = "An unexpected error occurred.";
  
      if (err.response) {
        console.log("Server Error Response:", err.response.data); // ✅ Debug print
        errorMessage =
          err.response.data?.error ||
          err.response.data?.message ||
          err.response.statusText ||
          `Server responded with status ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "No response from server. Check your network or backend.";
      } else {
        errorMessage = err.message;
      }
  
      setError(errorMessage);
  
    } finally {
      setLoading(false);
    }
  };
  

  return (
   
    <div className="min-h-screen flex flex-col bg-purple-300">
      
      {/* Main content wrapper: takes full width, grows vertically, has rounded corners */}
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-grow bg-white rounded-xl shadow-2xl overflow-hidden my-8"> {/* Added my-8 for vertical margin */}
        
        {/* === TOP BAR: Title, Language Selector, Run Button === */}
        <div className="p-6 bg-gray-800 text-white flex flex-col md:flex-row items-center justify-between rounded-t-xl">
          <h1 className="text-3xl font-extrabold text-blue-300 mb-4 md:mb-0">Online Code Compiler</h1>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div>
              <label htmlFor="language-select" className="sr-only">Language:</label> {/* sr-only for accessibility */}
              <select
                id="language-select"
                className="border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                
                <option value="c">C</option>
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunCode}
              className="bg-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 text-lg"
              disabled={loading}
            >
              {loading ? "Running Code..." : "Run Code"}
            </button>
          </div>
        </div>

        {/* === MAIN CONTENT AREA: Code Editor (Left) & Input/Output (Right) === */}
        {/* This div uses flex-grow to take up all remaining vertical space */}
        <div className="flex flex-col md:flex-row flex-grow">
          
          {/* === LEFT PANEL: Code Editor (Covers full left size) === */}
          {/* flex-grow on content here allows CodeEditor to fill available height */}
          <div className="md:w-3/4 p-6 flex flex-col border-r border-gray-200 bg-white">
            <div className="flex-grow"> {/* This div ensures CodeEditor takes all vertical space */}
              <CodeEditor language={language} code={code} setCode={setCode} />
            </div>
          </div>

          {/* === RIGHT PANEL: Input & Output/Error === */}
          {/* flex-grow on content here allows Input/Output to fill available height */}
          <div className="md:w-1/4 p-6 bg-gray-900 flex flex-col text-white">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">Input / Output</h2>

            {/* Input Box */}
            <div className="mb-6 flex-1 flex flex-col">
              <label htmlFor="input-box" className="block text-lg font-semibold text-gray-300 mb-2">Input (Optional):</label>
              <textarea
                id="input-box"
                className="w-full border border-gray-700 rounded-lg p-3 text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex-grow font-mono text-sm resize-none"
                rows={5}
                placeholder="Enter input here (e.g., numbers for an array, strings, etc.)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Output/Error Section */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Result:</h3>
              {loading && (
                <div className="text-blue-300 text-lg text-center flex-grow flex items-center justify-center">
                  <p>Executing your code. Please wait...</p>
                </div>
              )}

              {!loading && (output || error) && (
                <pre className={`flex-grow p-4 rounded-lg shadow-inner overflow-auto whitespace-pre-wrap font-mono text-sm ${output ? 'bg-gray-800 text-gray-100' : 'bg-red-900 text-red-100'}`}>
                  {output || error}
                </pre>
              )}

              {!loading && !output && !error && (
                <div className="flex-grow flex items-center justify-center text-gray-500 text-lg bg-gray-800 p-4 rounded-lg shadow-inner">
                  <p>Output will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Compiler;