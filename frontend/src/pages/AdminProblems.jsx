import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const difficultyClass = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: "", message: "" });

  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
        const matchesDifficulty = difficulty ? problem.difficulty === difficulty : true;
        return matchesSearch && matchesDifficulty;
      }),
    [difficulty, problems, search]
  );

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/problems`);
      setProblems(data.problems || []);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.error || "Failed to load problems.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (problem) => {
    const confirmed = window.confirm(`Delete "${problem.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/problems/${problem._id}`, {
        withCredentials: true,
      });
      setProblems((current) => current.filter((item) => item._id !== problem._id));
      setToast({ type: "success", message: "Problem deleted successfully." });
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.error || "Failed to delete problem.",
      });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-cyan-400">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Problem Management</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Search, edit, and maintain the problem bank for your online judge.
            </p>
          </div>
          <Link to="/admin/add-problem" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-cyan-500 dark:text-gray-950 dark:hover:bg-cyan-400">
            Add Problem
          </Link>
        </div>

        {toast.message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
                : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200"
            }`}
          >
            {toast.message}
          </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading problems...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No problems found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-950">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Difficulty</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredProblems.map((problem) => (
                    <tr key={problem._id} className="hover:bg-gray-50 dark:hover:bg-gray-950">
                      <td className="px-5 py-4">
                        <div className="font-semibold">{problem.title}</div>
                        <div className="mt-1 text-xs text-gray-500">{problem.slug}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyClass[problem.difficulty] || "bg-gray-100 text-gray-700"}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-md flex-wrap gap-1.5">
                          {(problem.tags || []).map((tag) => (
                            <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(problem.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Link to={`/admin/problems/${problem._id}/edit`} className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(problem)} className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-300">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
