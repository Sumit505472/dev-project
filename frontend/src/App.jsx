import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import axios from 'axios';
import './App.css';

function App() {
  const [code, setCode] = useState(`// Include the input/output stream library
#include <iostream> 

// Define the main function
int main() { 
    int a, b;
    std::cin >> a >> b;
    std::cout << "Sum: " << a + b; 
    return 0; 
}`);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    const payload = {
      language,
      code,
      input
    };

    try {
      const { data } = await axios.post('http://localhost:5000/run', payload);
      setOutput(data.output);
    } catch (error) {
      console.log(error?.response || error);
      setOutput("Error while compiling");
    }
  };

  return (
    <div className="min-h-screen bg-pink-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT SIDE: Editor + Run */}
        <div>
          <h1 className="text-3xl font-bold mb-4"> Online Code Compiler</h1>

          <div className="bg-white shadow-md rounded-md p-4 mb-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-2 px-2 py-1 border rounded"
            >
              <option value='cpp'>C++</option>
              <option value='c'>C</option>
              <option value='python'>Python</option>
              <option value='java'>Java</option>
            </select>

            <div className="bg-gray-100 border rounded h-96 overflow-y-auto">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={code => highlight(code, languages.js)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                  height: '100%',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            type="button"
            className="w-full py-2 text-white font-semibold rounded bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 flex justify-center items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Run
          </button>
        </div>

        {/* RIGHT SIDE: Input + Output */}
        <div className="flex flex-col justify-between">
          {/* Input */}
          <div>
            <label className="block text-lg font-medium mb-2">Input</label>
            <textarea
              placeholder="Enter input "
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 h-32 border rounded font-mono resize-none bg-white"
            ></textarea>
          </div>

          {/* Output */}
          <div className="mt-4">
            <label className="block text-lg font-medium mb-2">Output</label>
            <div className="w-full bg-gray-100 p-3 h-32 rounded font-mono shadow-inner overflow-y-auto text-sm whitespace-pre-wrap">
              {output || 'Output will appear here'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
