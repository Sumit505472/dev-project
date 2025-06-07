// src/pages/ProblemList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/problem`)
      .then(res => res.json())
      .then(data => setProblems(data.problems))
      
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Problems</h1>
      <ul className="space-y-2">
        {problems.map((p) => (
          <li key={p._id}>
            <Link to={`/problem/${p._id}`} className="text-blue-600 hover:underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemList;
