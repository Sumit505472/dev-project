// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from "../contexts/AuthContext";


import ProfileCard from "../components/ProfileCard";
import SubmissionTable from "../components/SubmissionTable";


const Dashboard = () => {
  const { user, loading } = useAuth();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (user) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/submissions/user/${user._id}`, {
          withCredentials: true,
        })
        .then((res) => setSubmissions(res.data.submissions))
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (loading) return <div className="text-center text-lg mt-10">Loading...</div>;
  if (!user) return <div className="text-center text-lg mt-10 text-red-500">Please login to access the dashboard.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <ProfileCard user={user} />
      <SubmissionTable submissions={submissions} />
    </div>
  );
};

export default Dashboard;
