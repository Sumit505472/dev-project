import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${import.meta.env.VITE_BACKEND_URL}/problem`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data && data.problems) {
                    setProblems(data.problems);
                } else if (Array.isArray(data)) {
                    setProblems(data);
                } else {
                    throw new Error("Unexpected data format from backend.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching problems:", err);
                setError("Failed to load problems. Please try again later.");
                setLoading(false);
            });
    }, []);

    // Helper function for difficulty classes (reusable and adapts to dark mode)
    const getDifficultyClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
            case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 bg-base-100 dark:bg-gray-900 text-base-content dark:text-gray-300">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-lg">Loading problems...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-md mx-auto max-w-md mt-10">
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 mx-auto max-w-md mt-10 bg-base-100 dark:bg-gray-900 rounded-lg shadow-md">
                <p className="text-lg">No problems found. Check back later!</p>
                <p className="mt-4">
                    <Link to="/admin/add-problem" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                        Admin: Add a new problem
                    </Link>
                </p>
            </div>
        );
    }

    return (
        // Use bg-base-200 for a slight background difference from the header if desired, or bg-base-100
        <div className="p-6 min-h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-base-200 dark:bg-gray-900 text-base-content dark:text-gray-200 transition-colors duration-200">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">Problem List</h1>
            
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                Difficulty
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {problems.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {p.question_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/problem/${p._id}`} className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                        {p.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyClass(p.difficulty)}`}>
                                        {p.difficulty}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProblemList;