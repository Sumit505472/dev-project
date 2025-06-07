import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";
import Aireview from "../components/aiReviewPanel";
const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your solution here");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [showInput, setShowInput] = useState(true);

  const [leftWidth, setLeftWidth] = useState(50); // % width of left panel
  const [editorHeightPercent, setEditorHeightPercent] = useState(60); // % height of editor in right panel

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAireview, setShowAireview] = useState(false);

  const containerRef = useRef(null);
  const isResizingVertical = useRef(false);
  const isResizingHorizontal = useRef(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/problem/${id}`);

        setProblem(res.data.problem || res.data);
      } catch (error) {
        console.error("Error fetching the problem:", error);
      }
    };
    fetchProblem();
  }, [id]);

  const handleVerticalMouseDown = () => {
    isResizingVertical.current = true;
  };

  const handleHorizontalMouseDown = () => {
    isResizingHorizontal.current = true;
  };

  const handleMouseUp = () => {
    isResizingVertical.current = false;
    isResizingHorizontal.current = false;
  };

  const handleMouseMove = (e) => {
    if (fullscreen) return;

    if (isResizingVertical.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      let newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newLeftWidth < 20) newLeftWidth = 20;
      if (newLeftWidth > 80) newLeftWidth = 80;
      setLeftWidth(newLeftWidth);
    } else if (isResizingHorizontal.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      let newHeightPx = e.clientY - containerRect.top;
      const maxHeight = containerRect.height - 60;
      if (newHeightPx < 100) newHeightPx = 100;
      if (newHeightPx > maxHeight) newHeightPx = maxHeight;
      const newHeightPercent = (newHeightPx / containerRect.height) * 100;
      setEditorHeightPercent(newHeightPercent);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [leftWidth, editorHeightPercent, fullscreen]);

  const monacoLanguageMap = {
    cpp: "cpp",
    python: "python",
    java: "java",
    C: "c",
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Handler for Run button
  const handleRun = async () => {
    setIsRunning(true);
    setVerdict("");
    setOutput("");

    try {
      const payload = {
        code,
        language,
        input,
      };

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, payload);
      // Assuming response contains { output: string, error: string|null }
      if (res.data.error) {
        setOutput(res.data.error);
        setVerdict("Runtime Error");
      } else {
        setOutput(res.data.output);
        setVerdict("Output");
      }
    } catch (error) {
      setOutput("Error running code. Please try again.");
      setVerdict("Error");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  // Handler for Submit button
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setVerdict("");
    setOutput("");

    try {
      const payload = {
        code,
        language,
        problemId: id,
      };

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/submit`, payload);
      // Assuming response contains { verdict: string, details?: string }
      if (res.data.verdict) {
        setVerdict(res.data.verdict);
        setOutput(res.data.details || "");
      } else {
        setVerdict("Unknown Result");
        setOutput("");
      }
    } catch (error) {
      setVerdict("Submission Error");
      setOutput("Error submitting code. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
 

  if (!problem) return <div className="p-6">Loading...</div>;

  return (
    <div
      ref={containerRef}
      className="flex h-[100vh] bg-gray-50 rounded shadow overflow-hidden select-none"
    >
      {/* Left panel */}
      {!fullscreen && (
        <div
          className="p-6 overflow-y-auto bg-white"
          style={{ width: `${leftWidth}%`, minWidth: "200px" }}
        >
          <h1 className="text-2xl font-bold mb-3">{problem.title}</h1>
          <h3 className="text-1xl font-bold mb-3">Difficulty: {problem.difficulty}</h3>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap">
            {problem.question_description || problem.description}
          </p>
          <h1 className="text-2xl font-bold mb-3">Input Format</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap">
            {problem.input_format}
          </p>
          <h1 className="text-2xl font-bold mb-3">Output Format</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap">
            {problem.output_format}
          </p>
          <h1 className="text-2xl font-bold mb-3">Sample Input</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap border-black border-2">
            {problem.test_cases[0].input}
          </p>
          <h1 className="text-2xl font-bold mb-3">Sample Output</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap border-black border-2">
            {problem.test_cases[0].output}
          </p>
          <h1 className="text-2xl font-bold mb-3">Constraints</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap border-black border-2">
            {problem.constraints}
          </p>
          <h1 className="text-2xl font-bold mb-3">Tags</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap border-black border-2">
            {problem.tags.join(', ')}
          </p>
          <h1 className="text-2xl font-bold mb-3">Time Limit</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap border-black border-2">
            {problem.time_limit}
          </p>
          <h1 className="text-2xl font-bold mb-3">Memory Limit</h1>
          <p className="mb-4 text-gray-700 whitespace-pre-wrap border-black border-2">
            {problem.memory_limit}
          </p>
        </div>
      )}

      {/* Vertical divider */}
      {!fullscreen && (
        <div
          onMouseDown={handleVerticalMouseDown}
          className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400"
          role="separator"
          aria-label="Resize problem and editor panels"
        />
      )}



      {/* Right panel */}
      <div
        className="flex flex-col bg-white shadow-md"
        style={{ width: fullscreen ? "100%" : `${100 - leftWidth}%` }}
      >

        <div className="flex justify-end p-2 border-b border-gray-200">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowAireview((prev) => !prev)}
          >
            {showAireview ? " Hide" : " Aireview"}
          </button>
        </div>


     


        {/* Top bar */}
        <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b select-none">
          <div className="flex items-center space-x-2">
            <label htmlFor="language-select" className="text-sm font-medium">
              Language:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-1 border rounded text-sm"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="C">C</option>
            </select>
          </div>

          <button
            onClick={toggleFullscreen}
            title={fullscreen ? "Minimize Editor" : "Maximize Editor"}
            className="px-2 py-1 text-lg font-bold bg-gray-300 rounded hover:bg-gray-400 transition select-none"
            aria-pressed={fullscreen}
          >
            {fullscreen ? "◀" : "▶"}
          </button>
        </div>

        {/* Editor */}
        <div
          style={{ height: `${editorHeightPercent}vh`, minHeight: "100px" }}
          className="overflow-hidden"
        >
          <Editor
            height="100%"
            language={monacoLanguageMap[language]}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Horizontal divider */}
        {!fullscreen && showInput && (
          <div
            onMouseDown={handleHorizontalMouseDown}
            className="h-1 cursor-row-resize bg-gray-300 hover:bg-gray-400"
            role="separator"
            aria-label="Resize editor and custom input"
          />
        )}
         

      

         {showAireview ? (
  <div className="border-t border-gray-300 p-4 bg-gray-50 max-h-70 overflow-auto">
    <Aireview code={code} />
  </div>
) : (
  !fullscreen &&
  showInput && (
    <div className="border-t border-gray-300 bg-gray-50 p-4 space-y-4 max-h-60 overflow-auto">
      {/* Input Textarea */}
      <textarea
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter custom input here"
        className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none"
        style={{ height: `${(100 - editorHeightPercent) / 2}vh`, minHeight: "60px" }}
      />

      {/* Output */}
      {output && (
        <div className="bg-gray-50 p-3 border-t border-gray-200 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-40">
          {output}
        </div>
      )}
    </div>
  )
)}

        {/* Bottom toolbar */}
        <div className="flex justify-between items-center space-x-2 p-3 border-t border-gray-200 select-none">
          <div className="font-bold mr-auto">
            Verdict:{" "}
            <span
              className={
                verdict === "Accepted"
                  ? "text-green-600"
                  : verdict && verdict !== "Output"
                    ? "text-red-600"
                    : "text-gray-500"
              }
            >
              {verdict || "Not yet run"}
            </span>
          </div>

          {/* Hide/Show Input toggle with notation */}
          <button
            onClick={() => setShowInput(!showInput)}
            className="text-sm px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition flex items-center"
            aria-pressed={showInput}
            aria-label={showInput ? "Hide custom input" : "Show custom input"}
            title={showInput ? "Hide custom input" : "Show custom input"}
          >
            {showInput ? "⌄" : "⌃"}
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className={`px-4 py-1 text-white text-sm rounded transition ${isRunning || isSubmitting
              ? "bg-yellow-300 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600"
              }`}
          >
            {isRunning ? "Running..." : "Run"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className={`px-4 py-1 text-white text-sm rounded transition ${isSubmitting || isRunning
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
