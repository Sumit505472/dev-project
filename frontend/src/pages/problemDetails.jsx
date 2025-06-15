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
    const [verdict, setVerdict] = useState(""); // For general verdict display
    const [input, setInput] = useState("");
    const [output, setOutput] = useState(""); // For run output
    const [submissionDetails, setSubmissionDetails] = useState(null); // NEW: To store full submission results
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

    const handleVerticalMouseDown = () => { isResizingVertical.current = true; };
    const handleHorizontalMouseDown = () => { isResizingHorizontal.current = true; };
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
    }, [fullscreen]);

    const monacoLanguageMap = {
        cpp: "cpp",
        python: "python",
        java: "java", // Ensure Java is mapped if your backend supports it
        c: "c",
    };

    const toggleFullscreen = () => setFullscreen(!fullscreen);

    const handleRun = async () => {
        setIsRunning(true);
        setVerdict(""); // Clear verdict
        setOutput(""); // Clear previous output
        setSubmissionDetails(null); // Clear previous submission results
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, { code, language, input });
            if (data.error) {
                setOutput(data.error);
                setVerdict("Execution Error"); // Changed from "Runtime Error" for clarity
            } else {
                setOutput(data.output);
                setVerdict("Output Display"); // Indicate it's just output
            }
        } catch (error) {
            setOutput("Error running code. Please try again.");
            setVerdict("Error");
            console.error(error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setVerdict(""); // Clear verdict
        setOutput(""); // Clear previous output (as detailed results will be shown)
        setSubmissionDetails(null); // Clear previous submission details

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/submit`, { code, language, problemId: id }, { withCredentials: true });
            
            // Assuming data contains { success, verdict, results }
            if (data.success) {
                setVerdict(data.verdict);
                setSubmissionDetails(data); // Store the entire data object
            } else {
                // Handle cases where success is false but not a caught error
                setVerdict("Submission Failed");
                setOutput(data.error || "Unknown error occurred during submission.");
            }
        } catch (error) {
            setVerdict("Submission Error");
            // Check if error.response exists and has data for more specific backend errors
            if (error.response && error.response.data && error.response.data.error) {
                setOutput(`Error: ${error.response.data.error}`);
            } else {
                setOutput("Error submitting code. Please try again.");
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDifficultyClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!problem) return <div className="p-6 text-center text-gray-500">Loading Problem...</div>;

    return (
        <div ref={containerRef} className="flex h-[90vh] bg-gray-50 overflow-hidden select-none">
            {/* --- Enhanced Left Panel --- */}
            {!fullscreen && (
                <div className="p-6 overflow-y-auto bg-white" style={{ width: `${leftWidth}%`, minWidth: "300px" }}>
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{problem.title}</h1>
                            <span className={`text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${getDifficultyClass(problem.difficulty)}`}>
                                {problem.difficulty}
                            </span>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                            <p>{problem.question_description || problem.description}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Input Format</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{problem.input_format}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Output Format</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{problem.output_format}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sample Cases</h3>
                            <div className="space-y-4">
                                {/* Ensure test_cases[0] exists before trying to access it */}
                                {problem.test_cases && problem.test_cases.length > 0 && (
                                    <>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Sample Input</h4>
                                            <pre className="text-sm text-gray-800 bg-white p-2 rounded">{problem.test_cases[0].input}</pre>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Sample Output</h4>
                                            <pre className="text-sm text-gray-800 bg-white p-2 rounded">{problem.test_cases[0].output}</pre>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Constraints</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{problem.constraints}</p>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800">Time Limit</h4>
                                <p className="text-sm text-gray-600">{problem.time_limit}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800">Memory Limit</h4>
                                <p className="text-sm text-gray-600">{problem.memory_limit}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {problem.tags && problem.tags.map(tag => (
                                    <span key={tag} className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vertical divider */}
            {!fullscreen && <div onMouseDown={handleVerticalMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-300 transition-colors" />}

            {/* --- Right Panel --- */}
            <div className="flex flex-col bg-white" style={{ width: fullscreen ? "100%" : `${100 - leftWidth}%` }}>
                <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b select-none">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="language-select" className="text-sm font-medium">Language:</label>
                        <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="p-1 border rounded text-sm">
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option> {/* Ensure this is here if backend supports */}
                            <option value="c">C</option>
                        </select>
                    </div>
                    <button onClick={toggleFullscreen} title={fullscreen ? "Minimize" : "Maximize"} className="px-2 py-1 text-lg font-bold bg-gray-300 rounded hover:bg-gray-400">
                        {fullscreen ? "◀" : "▶"}
                    </button>
                </div>

                <div style={{ height: `${editorHeightPercent}vh`, minHeight: "100px" }} className="overflow-hidden">
                    <Editor height="100%" language={monacoLanguageMap[language]} theme="vs-dark" value={code} onChange={(val) => setCode(val)} options={{ fontSize: 16, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }} />
                </div>

                {!fullscreen && showInput && <div onMouseDown={handleHorizontalMouseDown} className="h-1.5 cursor-row-resize bg-gray-200 hover:bg-blue-300 transition-colors" />}
                
                {/* Conditional Rendering of AI Review, Input/Output, or Submission Results */}
                {showAireview ? (
                    <div className="border-t border-gray-300 p-4 bg-gray-50 flex-grow overflow-auto">
                        <Aireview code={code} />
                    </div>
                ) : (
                    // Show Input/Output for /run OR Submission Details for /submit
                    !fullscreen && (
                        <div className="bg-gray-50 p-4 space-y-4 flex-grow overflow-auto">
                            {/* Display simple output from /run */}
                            {!submissionDetails && showInput && (
                                <>
                                    <textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter custom input here" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
                                    {output && <div className="bg-white p-3 border rounded text-sm font-mono whitespace-pre-wrap overflow-auto">{output}</div>}
                                </>
                            )}

                            {/* Display detailed submission results from /submit */}
                            {submissionDetails && submissionDetails.results && submissionDetails.results.length > 0 && (
                                <div className="mt-4 bg-white shadow-md rounded-lg overflow-hidden">
                                    <h3 className="text-xl font-semibold text-gray-800 p-4 border-b">Detailed Test Results</h3>
                                    <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error/Stderr</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {submissionDetails.results.map((res, index) => (
                                                    <tr key={index} className={res.passed ? 'bg-green-50' : 'bg-red-50'}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {res.passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 font-mono max-w-xs overflow-x-auto">{res.input}</td>
                                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 font-mono max-w-xs overflow-x-auto">{res.expected}</td>
                                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 font-mono max-w-xs overflow-x-auto">{res.actual}</td>
                                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-red-700 font-mono max-w-xs overflow-x-auto">
                                                            {res.error || res.stderr || ''}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}

                <div className="flex justify-between items-center space-x-4 p-3 border-t bg-white">
                    <div className="font-semibold text-sm">
                        Verdict: <span className={verdict === "Accepted" ? "text-green-600" : (verdict && verdict !== "Output Display" ? "text-red-600" : "text-gray-500")}>{verdict || "Not Run"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setShowInput(!showInput)} className="text-sm px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300" title={showInput ? "Hide Input" : "Show Input"}>{showInput ? "⌄" : "⌃"}</button>
                        <button onClick={() => setShowAireview((p) => !p)} className={`px-4 py-1.5 text-white text-sm rounded transition ${showAireview ? "bg-purple-700" : "bg-purple-600 hover:bg-purple-700"}`}>
                            {showAireview ? "Hide AI" : "AI Review"}
                        </button>
                        <button onClick={handleRun} disabled={isRunning || isSubmitting} className="px-4 py-1.5 text-white text-sm rounded transition bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed">
                            {isRunning ? "Running..." : "Run"}
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting || isRunning} className="px-4 py-1.5 text-white text-sm rounded transition bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;
