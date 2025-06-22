import React from 'react';
import { Link } from 'react-router-dom';

export default function SubmissionTable({ submissions }) {

    // Helper function to get verdict specific classes
    const getVerdictClass = (verdict) => {
        switch (verdict) {
            case 'Accepted':
                return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100';
            case 'Wrong Answer':
            case 'Time Limit Exceeded':
            case 'Runtime Error':
            case 'Memory Limit Exceeded':
                return 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100';
            case 'Compilation Error':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'; 
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] bg-base-200 dark:bg-gray-900 text-base-content dark:text-gray-200 transition-colors duration-200">
            
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                My Submissions
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-700 p-4 mt-6 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Submissions History</h3>
                
                {submissions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No submissions found. Solve some problems to see your history!</p>
                ) : (
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Problem</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Language</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Verdict</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {submissions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="p-3 whitespace-nowrap text-gray-900 dark:text-gray-100">
                                        {sub.problem?._id ? (
                                            <Link
                                                to={`/problem/${sub.problem._id}`}
                                                className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {sub.problem.title}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">Unknown Problem</span>
                                        )}
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{sub.language}</td>
                                    <td className="p-3 whitespace-nowrap">
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getVerdictClass(sub.verdict)}`}
                                        >
                                            {sub.verdict}
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {new Date(sub.submittedAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}