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
    const [submissionDetails, setSubmissionDetails] = useState(null); // To store full submission results
    const [fullscreen, setFullscreen] = useState(false);
    
    // Controls visibility of the entire bottom console section.
    const [showConsole, setShowConsole] = useState(true); 

    // State for AI Review panel maximization
    const [isAiReviewMaximized, setIsAiReviewMaximized] = useState(false);

    const [leftWidth, setLeftWidth] = useState(50); // % width of left panel
    const [editorHeightPercent, setEditorHeightPercent] = useState(60); // % height of editor in right panel

    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAireview, setShowAireview] = useState(false);

    const containerRef = useRef(null);
    const isResizingVertical = useRef(false);
    const isResizingHorizontal = useRef(false);

    // Function to get the current theme from the HTML data-theme attribute
    // This allows Monaco to react to the theme change
    const getMonacoTheme = () => {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs-light';
    };
    const [monacoTheme, setMonacoTheme] = useState(getMonacoTheme());

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

        // Add a MutationObserver to listen for changes on the 'html' element's 'data-theme' attribute
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    setMonacoTheme(getMonacoTheme()); // Update Monaco theme when data-theme changes
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });

        // Cleanup the observer on component unmount
        return () => observer.disconnect();
    }, [id]); // Depend on 'id' for problem fetching, and empty array for initial observer setup


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
            // Calculate relative Y position, considering the header height if present
            const headerHeight = document.querySelector('nav.h-16') ? 64 : 0; // Assuming header height is 64px (h-16)
            let newHeightPx = e.clientY - containerRect.top - headerHeight; 
            
            // Adjust max height calculation to consider the actual height of the parent div minus fixed elements
            const totalRightPanelHeight = containerRect.height - headerHeight;
            const bottomBarHeight = 64; // Assuming your bottom bar is roughly 64px tall (p-3 + padding)
            const minEditorHeight = 100; // Minimum pixel height for editor
            const maxEditorHeight = totalRightPanelHeight - bottomBarHeight - 1.5; // total height minus bottom bar and divider
            
            if (newHeightPx < minEditorHeight) newHeightPx = minEditorHeight;
            if (newHeightPx > maxEditorHeight) newHeightPx = maxEditorHeight;

            const newHeightPercent = (newHeightPx / totalRightPanelHeight) * 100;
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
        c: "c",
    };

    const toggleFullscreen = () => setFullscreen(!fullscreen);

    const handleRun = async () => {
        setIsRunning(true);
        setVerdict(""); // Clear verdict
        setOutput(""); // Clear previous output
        setSubmissionDetails(null); // Clear previous submission results
        setShowAireview(false); // Hide AI review when running/submitting
        setShowConsole(true); // Ensure console is visible when running
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
        setShowAireview(false); // Hide AI review when running/submitting
        setShowConsole(true); // Ensure console is visible when running/submitting

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

    // Handler to clear submission results
    const handleClearResults = () => {
        setSubmissionDetails(null);
        setOutput("");
        setVerdict(""); // Reset verdict
    };

    // Handler to toggle AI Review panel size
    const toggleAiReviewMaximize = () => {
        setIsAiReviewMaximized(prev => !prev);
    };

    const getDifficultyClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
            case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
        }
    };

    if (!problem) return <div className="p-6 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-800 min-h-screen">Loading Problem...</div>;

    return (
        
        <div ref={containerRef} className="flex h-[calc(100vh-4rem)] bg-base-200 overflow-hidden ">
            {/* --- Enhanced Left Panel --- */}
            {!fullscreen && (
                <div className="p-6 overflow-y-auto bg-base-100 dark:bg-gray-800 text-base-content dark:text-gray-200 transition-colors" style={{ width: `${leftWidth}%`, minWidth: "300px" }}>
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{problem.title}</h1>
                            <span className={`text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${getDifficultyClass(problem.difficulty)}`}>
                                {problem.difficulty}
                            </span>
                        </div>

                        {/* Prose for rich text content, adjusts for dark mode */}
                        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            <p>{problem.question_description || problem.description}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Input Format</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{problem.input_format}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Output Format</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{problem.output_format}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Sample Cases</h3>
                            <div className="space-y-4">
                                {problem.test_cases && problem.test_cases.length > 0 && (
                                    <>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Sample Input</h4>
                                            <pre className="text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 p-2 rounded">{problem.test_cases[0].input}</pre>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Sample Output</h4>
                                            <pre className="text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 p-2 rounded">{problem.test_cases[0].output}</pre>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Constraints</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{problem.constraints}</p>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Time Limit</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{problem.time_limit}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Memory Limit</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{problem.memory_limit}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {problem.tags && problem.tags.map(tag => (
                                    <span key={tag} className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vertical divider */}
            {!fullscreen && <div onMouseDown={handleVerticalMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-300 transition-colors dark:bg-gray-700 dark:hover:bg-blue-600" />}

            {/* --- Right Panel --- */}
            <div className="flex flex-col bg-white dark:bg-gray-900 transition-colors" style={{ width: fullscreen ? "100%" : `${100 - leftWidth}%` }}>
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 select-none">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Language:</label>
                        <select 
                            id="language-select" 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            className="p-1 border rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                            <option value="c">C</option>
                        </select>
                    </div>
                    <button onClick={toggleFullscreen} title={fullscreen ? "Minimize" : "Maximize"} className="px-2 py-1 text-lg font-bold bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100">
                        {fullscreen ? "🗕" : "🗖"} {/* Maximize/Minimize button for editor */}
                    </button>
                </div>

                {/* Monaco Editor */}
                <div style={{ height: `${editorHeightPercent}%`, minHeight: "100px" }} className="overflow-hidden">
                    <Editor 
                        height="100%" 
                        language={monacoLanguageMap[language]} 
                        theme={monacoTheme} // Use the dynamic theme here
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

                {/* Horizontal divider (only shown if console is visible and not fullscreen) */}
                {!fullscreen && showConsole && <div onMouseDown={handleHorizontalMouseDown} className="h-1.5 cursor-row-resize bg-gray-200 hover:bg-blue-300 transition-colors dark:bg-gray-700 dark:hover:bg-blue-600" />}
                
                {/* Conditional Rendering of AI Review or Console (Input/Output/Results) */}
                {showAireview ? (
                    <div className={`border-t border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 flex flex-col ${isAiReviewMaximized ? 'flex-grow' : 'h-64'}`}> {/* Dynamic height */}
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">AI Code Review</h3>
                            {/* Expand/Collapse Button for AI Review - using square-like symbols */}
                            <button 
                                onClick={toggleAiReviewMaximize} 
                                className="px-3 py-1 text-lg font-bold rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                                title={isAiReviewMaximized ? "Collapse AI Review" : "Expand AI Review"}
                            >
                                {isAiReviewMaximized ? "🗕" : "🗖"} {/* Collapse/Expand button for AI review */}
                            </button>
                        </div>
                        <div className="flex-grow overflow-auto">
                            <Aireview code={code} />
                        </div>
                    </div>
                ) : (
                    // Show Console (Input/Output/Results) if not fullscreen and showConsole is true
                    !fullscreen && showConsole && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 space-y-4 flex-grow overflow-auto text-base-content dark:text-gray-200">
                            {/* Display simple output from /run OR custom input area */}
                            {!submissionDetails ? ( // Only show input/output if no submission details
                                <>
                                    <textarea 
                                        rows={4} 
                                        value={input} 
                                        onChange={(e) => setInput(e.target.value)} 
                                        placeholder="Enter custom input here" 
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" 
                                    />
                                    {output && <div className="bg-white dark:bg-gray-900 p-3 border rounded text-sm font-mono whitespace-pre-wrap overflow-auto text-gray-800 dark:text-gray-100">{output}</div>}
                                </>
                            ) : (
                                // Display detailed submission results from /submit
                                submissionDetails.results && submissionDetails.results.length > 0 && (
                                    <div className="mt-4 bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 p-4 border-b border-gray-200 dark:border-gray-700">Detailed Test Results</h3>
                                        <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Input</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expected</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actual</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Error/Stderr</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {submissionDetails.results.map((res, index) => (
                                                        <tr key={index} className={res.passed ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.passed ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                                                                    {res.passed ? 'Passed' : 'Failed'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono max-w-xs overflow-x-auto">{res.input}</td>
                                                            <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono max-w-xs overflow-x-auto">{res.expected}</td>
                                                            <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono max-w-xs overflow-x-auto">{res.actual}</td>
                                                            <td className="px-6 py-4 whitespace-pre-wrap text-sm text-red-700 dark:text-red-300 font-mono max-w-xs overflow-x-auto">
                                                                {res.error || res.stderr || ''}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )
                )}

                <div className="flex justify-between items-center space-x-4 p-3 border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        Verdict: <span className={verdict === "Accepted" ? "text-green-600 dark:text-green-400" : (verdict && verdict !== "Output Display" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400")}>{verdict || "Not Run"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Clear Results Button - appears only when submissionDetails are present */}
                        {submissionDetails && (
                            <button 
                                onClick={handleClearResults} 
                                className="px-4 py-1.5 text-white text-sm rounded transition bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
                            >
                                Clear Results
                            </button>
                        )}
                        
                        <button onClick={() => setShowConsole(!showConsole)} className="px-3 py-1.5 text-lg font-bold bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100" title={showConsole ? "Hide Console" : "Show Console"}>
                            {showConsole ? "➖" : "➕"} {/* Minus for hide, Plus for show */}
                        </button>
                        <button onClick={() => setShowAireview((p) => !p)} className={`px-4 py-1.5 text-white text-sm rounded transition ${showAireview ? "bg-purple-700" : "bg-purple-600 hover:bg-purple-700"} dark:bg-purple-800 dark:hover:bg-purple-700`}>
                            {showAireview ? "Hide AI" : "AI Review"}
                        </button>
                        <button onClick={handleRun} disabled={isRunning || isSubmitting} className="px-4 py-1.5 text-white text-sm rounded transition bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed dark:bg-yellow-700 dark:hover:bg-yellow-800 dark:disabled:bg-yellow-900">
                            {isRunning ? "Running..." : "Run"}
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting || isRunning} className="px-4 py-1.5 text-white text-sm rounded transition bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-blue-900">
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;