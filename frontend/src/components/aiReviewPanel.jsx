import React, { useEffect, useState } from "react";
import axios from "axios";

const Aireview = ({ code }) => {
  const [aiReview, setAiReview] = useState("");
  const [isReviewing, setIsReviewing] = useState(true);

  useEffect(() => {
    if (!code) return;

    const fetchReview = async () => {
      setIsReviewing(true);
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ai-review`, { code });
        if (res.data.success && res.data.review) {
          setAiReview(res.data.review);
        } else {
          setAiReview("No review generated.");
        }
      } catch (error) {
        setAiReview("Error generating AI review. Please try again.");
        console.error("AI Review Error:", error);
      } finally {
        setIsReviewing(false);
      }
    };

    fetchReview();
  }, [code]);

  return (
    // The parent div that wraps Aireview in ProblemDetail handles its own background.
    // Here, we ensure text within Aireview also adapts.
    <div className="text-gray-800 dark:text-gray-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">AI Code Review</h2>
      {isReviewing ? (
        // Text color for the "Generating review..." message
        <p className="text-gray-600 dark:text-gray-400">Generating review...</p>
      ) : (
        
        <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded border border-gray-300 dark:border-gray-600 max-h-[75vh] min-h-[200px] overflow-auto text-base leading-relaxed text-gray-800 dark:text-gray-100">
          {aiReview}
        </pre>
      )}
    </div>
  );
};

export default Aireview;