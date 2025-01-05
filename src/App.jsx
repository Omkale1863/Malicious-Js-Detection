import React, { useState } from "react";

const App = () => {
  const [code, setCode] = useState("");
  const [results, setResults] = useState("");

  const analyzeCode = () => {
    const suspiciousPatterns = [
      /eval/,
      /Function/,
      /document\.write/,
      /innerHTML\s*=/,
      /fetch/,
      /XMLHttpRequest/,
    ];
    const sandbox = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `
          onmessage = function(e) {
            try {
              eval(e.data.code); // Unsafe code execution
              postMessage({ result: "Executed without error." });
            } catch (err) {
              postMessage({ result: "Error detected: " + err.message });
            }
          }
        `,
          ],
          { type: "application/javascript" }
        )
      )
    );

    sandbox.onmessage = (event) => {
      const detection = suspiciousPatterns
        .filter((pattern) => pattern.test(code))
        .map((pattern) => `Suspicious pattern: ${pattern}`);
      setResults(`${event.data.result}\n${detection.join("\n")}`);
      sandbox.terminate();
    };

    sandbox.postMessage({ code });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-blue-100 py-8 px-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Malicious JavaScript Detector
        </h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
          Analyze JavaScript code for potentially harmful patterns. Paste your code below and click "Analyze" to check.
        </p>
        <textarea
          className="w-full h-40 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none mb-6"
          placeholder="Paste your JavaScript code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="flex justify-center">
          <button
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
            onClick={analyzeCode}
          >
            Analyze
          </button>
        </div>
        {results && (
          <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Analysis Results
            </h3>
            <pre className="text-gray-600 whitespace-pre-wrap overflow-x-auto">{results}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
