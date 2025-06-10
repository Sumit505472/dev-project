// src/components/SubmissionTable.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function SubmissionTable({ submissions }) {
    return (
        <div className="bg-white rounded-xl shadow p-4 mt-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Your Submissions</h3>
            {submissions.length === 0 ? (
                <p className="text-gray-500">No submissions found.</p>
            ) : (
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Problem</th>
                            <th className="p-2 text-left">Language</th>
                            <th className="p-2 text-left">Verdict</th>
                            <th className="p-2 text-left">Submitted At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((sub) => (
                            <tr key={sub._id} className="border-b hover:bg-gray-50">
                                <td className="p-2">
                                    {sub.problem?._id ? (
                                        <Link
                                            to={`/problem/${sub.problem._id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {sub.problem.title}
                                        </Link>
                                    ) : (
                                        'Unknown'
                                    )}
                                </td>
                                <td className="p-2">{sub.language}</td>
                                <td className="p-2">
                                    <span
                                        className={`px-2 py-1 rounded text-sm font-semibold ${sub.verdict === 'Accepted'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {sub.verdict}
                                    </span>
                                </td>
                                <td className="p-2">{new Date(sub.submittedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
