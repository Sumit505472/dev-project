// src/pages/ProblemList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Set loading to true before fetching
        setLoading(true);
        setError(null); // Clear previous errors

        
       
        fetch(`${import.meta.env.VITE_BACKEND_URL}/problem`)
            .then(res => {
                if (!res.ok) {
                    // If response is not OK (e.g., 404, 500), throw an error
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Ensure data.problems exists or data itself is the array
                if (data && data.problems) {
                    setProblems(data.problems);
                } else if (Array.isArray(data)) {
                    setProblems(data); // If the API directly returns an array
                } else {
                    throw new Error("Unexpected data format from backend.");
                }
                setLoading(false); // Set loading to false on success
            })
            .catch(err => {
                console.error("Error fetching problems:", err);
                setError("Failed to load problems. Please try again later."); // User-friendly error message
                setLoading(false); // Set loading to false on error
            });
    }, []); // Empty dependency array means this runs once on component mount

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-lg text-gray-700">Loading problems...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600 bg-red-100 rounded-md mx-auto max-w-md mt-10">
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 mx-auto max-w-md mt-10">
                <p className="text-lg">No problems found. Check back later!</p>
                {/* Optional: Add a link for admins to add problems */}
                <p className="mt-4">
                    <Link to="/admin/add-problem" className="text-blue-600 hover:underline">
                        Admin: Add a new problem
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Problem List</h1>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                                Difficulty
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {problems.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {p.question_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/problem/${p._id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                        {p.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        p.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                        p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
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
