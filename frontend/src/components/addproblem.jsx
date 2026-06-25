import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const emptyExample = { input: "", output: "", explanation: "" };
const hiddenTestCaseTemplate = `Input:

Output:
`;

const createInitialForm = () => ({
  title: "",
  slug: "",
  difficulty: "Easy",
  description: "",
  input_format: "",
  output_format: "",
  constraints: "",
  tags: "",
  examples: [{ ...emptyExample }],
  hidden_test_cases_text: hiddenTestCaseTemplate,
  time_limit: 1,
  memory_limit: 256,
});

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40";

const labelClass = "mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200";
const errorClass = "mt-1 text-xs font-medium text-red-600 dark:text-red-300";

const hiddenTestCasesToText = (testCases = []) =>
  testCases
    .map(
      (testCase) => `Input:
${testCase.input || ""}
Output:
${testCase.output || ""}`
    )
    .join("\n\n===CASE===\n\n");

const parseHiddenTestCasesText = (value = "") => {
  const parseErrors = {};
  const text = String(value || "").trim();

  if (!text) {
    return {
      testCases: [],
      errors: { hidden_test_cases_text: "At least one hidden test case is required" },
    };
  }

  const blocks = text
    .split(/^\s*===CASE===\s*$/gim)
    .map((block) => block.trim())
    .filter(Boolean);

  const testCases = blocks.map((block, index) => {
    const inputMatch = block.match(/Input:\s*([\s\S]*?)(?=\n\s*Output:\s*|$)/i);
    const outputMatch = block.match(/Output:\s*([\s\S]*)$/i);
    const input = inputMatch?.[1]?.trim() || "";
    const output = outputMatch?.[1]?.trim() || "";

    if (!/^\s*Input:/im.test(block)) {
      parseErrors[`hidden_test_cases.${index}.input`] = `Case ${index + 1} is missing an Input: label`;
    } else if (!input) {
      parseErrors[`hidden_test_cases.${index}.input`] = `Case ${index + 1} input is required`;
    }

    if (!/^\s*Output:/im.test(block)) {
      parseErrors[`hidden_test_cases.${index}.output`] = `Case ${index + 1} is missing an Output: label`;
    } else if (!output) {
      parseErrors[`hidden_test_cases.${index}.output`] = `Case ${index + 1} output is required`;
    }

    return { input, output };
  });

  if (testCases.length === 0) {
    parseErrors.hidden_test_cases_text = "At least one hidden test case is required";
  }

  return { testCases, errors: parseErrors };
};

export default function AddProblemForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(createInitialForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const pageTitle = isEditMode ? "Edit Problem" : "Add Problem";

  useEffect(() => {
    if (!isEditMode) return;

    const loadProblem = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/problems/${id}`);
        const problem = data.problem || data;
        setFormData({
          title: problem.title || "",
          slug: problem.slug || "",
          difficulty: problem.difficulty || "Easy",
          description: problem.description || "",
          input_format: problem.input_format || "",
          output_format: problem.output_format || "",
          constraints: problem.constraints || "",
          tags: Array.isArray(problem.tags) ? problem.tags.join(", ") : "",
          examples: problem.examples?.length ? problem.examples : [{ ...emptyExample }],
          hidden_test_cases_text: hiddenTestCasesToText(
            problem.hidden_test_cases?.length
              ? problem.hidden_test_cases
              : problem.test_cases?.length
                ? problem.test_cases
                : []
          ) || hiddenTestCaseTemplate,
          time_limit: problem.time_limit || 1,
          memory_limit: problem.memory_limit || 256,
        });
      } catch (error) {
        setToast({
          type: "error",
          message: error.response?.data?.error || "Failed to load problem.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id, isEditMode]);

  const parsedHiddenTestCases = useMemo(
    () => parseHiddenTestCasesText(formData.hidden_test_cases_text),
    [formData.hidden_test_cases_text]
  );

  const stats = useMemo(
    () => ({
      examples: formData.examples.length,
      hidden: parsedHiddenTestCases.testCases.length,
      tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean).length,
    }),
    [formData.examples.length, formData.tags, parsedHiddenTestCases.testCases.length]
  );

  const updateField = (name, value) => {
    setFormData((current) => {
      const next = { ...current, [name]: value };

      if (name === "title" && !isSlugTouched) {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const updateArrayItem = (collection, index, field, value) => {
    setFormData((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (collection, item) => {
    setFormData((current) => ({
      ...current,
      [collection]: [...current[collection], { ...item }],
    }));
  };

  const removeArrayItem = (collection, index) => {
    setFormData((current) => ({
      ...current,
      [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const requiredFields = [
      "title",
      "difficulty",
      "description",
      "input_format",
      "output_format",
      "constraints",
    ];

    requiredFields.forEach((field) => {
      if (!String(formData[field] || "").trim()) {
        nextErrors[field] = "This field is required";
      }
    });

    if (formData.examples.length === 0) {
      nextErrors.examples = "At least one example is required";
    }

    formData.examples.forEach((example, index) => {
      if (!example.input.trim()) nextErrors[`examples.${index}.input`] = "Input is required";
      if (!example.output.trim()) nextErrors[`examples.${index}.output`] = "Output is required";
    });

    Object.assign(nextErrors, parsedHiddenTestCases.errors);

    if (Number(formData.time_limit) < 1) {
      nextErrors.time_limit = "Minimum time limit is 1 second";
    }

    if (Number(formData.memory_limit) < 1) {
      nextErrors.memory_limit = "Minimum memory limit is 1 MB";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => ({
    ...formData,
    tags: formData.tags,
    time_limit: Number(formData.time_limit || 1),
    memory_limit: Number(formData.memory_limit || 256),
    examples: formData.examples.map((example) => ({
      input: example.input,
      output: example.output,
      explanation: example.explanation || "",
    })),
    hidden_test_cases: parsedHiddenTestCases.testCases.map((testCase) => ({
      input: testCase.input,
      output: testCase.output,
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ type: "", message: "" });

    if (!validate()) {
      setToast({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    try {
      setIsSubmitting(true);
      const url = isEditMode
        ? `${import.meta.env.VITE_BACKEND_URL}/api/problems/${id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/problems/add`;
      const method = isEditMode ? "put" : "post";

      await axios[method](url, buildPayload(), { withCredentials: true });
      setToast({
        type: "success",
        message: isEditMode ? "Problem updated successfully." : "Problem created successfully.",
      });
      navigate("/admin");
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      setErrors(apiErrors);
      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to save problem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8 text-center text-gray-600 dark:bg-gray-950 dark:text-gray-300">
        Loading problem...
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to="/admin" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400">
              Back to Admin Problems
            </Link>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Build LeetCode-style problems with public examples and private judge cases.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-900">{stats.examples} examples</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-900">{stats.hidden} hidden tests</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-900">{stats.tags} tags</span>
          </div>
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

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-bold">Problem Information</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Title</label>
              <input value={formData.title} onChange={(e) => updateField("title", e.target.value)} className={fieldClass} placeholder="Two Sum" />
              {errors.title && <p className={errorClass}>{errors.title}</p>}
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                value={formData.slug}
                onChange={(e) => {
                  setIsSlugTouched(true);
                  updateField("slug", slugify(e.target.value));
                }}
                className={fieldClass}
                placeholder="two-sum"
              />
              {errors.slug && <p className={errorClass}>{errors.slug}</p>}
            </div>
            <div>
              <label className={labelClass}>Difficulty</label>
              <select value={formData.difficulty} onChange={(e) => updateField("difficulty", e.target.value)} className={fieldClass}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {errors.difficulty && <p className={errorClass}>{errors.difficulty}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass}>Description</label>
            <textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} className={`${fieldClass} min-h-44 font-mono`} placeholder="Write the full problem statement..." />
            {errors.description && <p className={errorClass}>{errors.description}</p>}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Input Format</label>
              <textarea value={formData.input_format} onChange={(e) => updateField("input_format", e.target.value)} className={`${fieldClass} min-h-28 font-mono`} />
              {errors.input_format && <p className={errorClass}>{errors.input_format}</p>}
            </div>
            <div>
              <label className={labelClass}>Output Format</label>
              <textarea value={formData.output_format} onChange={(e) => updateField("output_format", e.target.value)} className={`${fieldClass} min-h-28 font-mono`} />
              {errors.output_format && <p className={errorClass}>{errors.output_format}</p>}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Constraints</label>
              <textarea value={formData.constraints} onChange={(e) => updateField("constraints", e.target.value)} className={`${fieldClass} min-h-28 font-mono`} />
              {errors.constraints && <p className={errorClass}>{errors.constraints}</p>}
            </div>
            <div>
              <label className={labelClass}>Tags</label>
              <input value={formData.tags} onChange={(e) => updateField("tags", e.target.value)} className={fieldClass} placeholder="array, hash-table, greedy" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Examples</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visible examples shown on the problem page.</p>
            </div>
            <button type="button" onClick={() => addArrayItem("examples", emptyExample)} className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-cyan-500 dark:text-gray-950 dark:hover:bg-cyan-400">
              Add Example
            </button>
          </div>
          {errors.examples && <p className={errorClass}>{errors.examples}</p>}

          <div className="mt-5 space-y-4">
            {formData.examples.map((example, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Example {index + 1}</h3>
                  <button type="button" onClick={() => removeArrayItem("examples", index)} disabled={formData.examples.length === 1} className="text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-300">
                    Remove
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Input</label>
                    <textarea value={example.input} onChange={(e) => updateArrayItem("examples", index, "input", e.target.value)} className={`${fieldClass} min-h-24 font-mono`} />
                    {errors[`examples.${index}.input`] && <p className={errorClass}>{errors[`examples.${index}.input`]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Output</label>
                    <textarea value={example.output} onChange={(e) => updateArrayItem("examples", index, "output", e.target.value)} className={`${fieldClass} min-h-24 font-mono`} />
                    {errors[`examples.${index}.output`] && <p className={errorClass}>{errors[`examples.${index}.output`]}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Explanation</label>
                  <textarea value={example.explanation || ""} onChange={(e) => updateArrayItem("examples", index, "explanation", e.target.value)} className={`${fieldClass} min-h-20`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Hidden Test Cases</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Paste private judge cases in bulk. Separate cases with <span className="font-mono">===CASE===</span>.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {parsedHiddenTestCases.testCases.length} parsed
            </span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
            <div>
              <label className={labelClass}>Bulk Test Case Input</label>
              <textarea
                value={formData.hidden_test_cases_text}
                onChange={(e) => updateField("hidden_test_cases_text", e.target.value)}
                className={`${fieldClass} min-h-[360px] font-mono leading-6`}
                spellCheck="false"
                placeholder={`Input:
1 2
Output:
3

===CASE===

Input:
5 7
Output:
12`}
              />
              {errors.hidden_test_cases_text && <p className={errorClass}>{errors.hidden_test_cases_text}</p>}
              {Object.entries(errors)
                .filter(([key]) => key.startsWith("hidden_test_cases."))
                .map(([key, message]) => (
                  <p key={key} className={errorClass}>{message}</p>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Parsed Preview</h3>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {parsedHiddenTestCases.testCases.length} cases
                </span>
              </div>

              <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {parsedHiddenTestCases.testCases.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Valid hidden test cases will appear here before saving.
                  </p>
                ) : (
                  parsedHiddenTestCases.testCases.map((testCase, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Case {index + 1}</h4>
                        {(errors[`hidden_test_cases.${index}.input`] || errors[`hidden_test_cases.${index}.output`]) && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/50 dark:text-red-200">
                            Invalid
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Input</p>
                      <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-gray-100 p-2 text-xs text-gray-800 dark:bg-gray-950 dark:text-gray-200">{testCase.input || "(empty)"}</pre>
                      <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Output</p>
                      <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-gray-100 p-2 text-xs text-gray-800 dark:bg-gray-950 dark:text-gray-200">{testCase.output || "(empty)"}</pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-bold">Judge Configuration</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Time Limit (seconds)</label>
              <input type="number" min="1" value={formData.time_limit} onChange={(e) => updateField("time_limit", e.target.value)} className={fieldClass} />
              {errors.time_limit && <p className={errorClass}>{errors.time_limit}</p>}
            </div>
            <div>
              <label className={labelClass}>Memory Limit (MB)</label>
              <input type="number" min="1" value={formData.memory_limit} onChange={(e) => updateField("memory_limit", e.target.value)} className={fieldClass} />
              {errors.memory_limit && <p className={errorClass}>{errors.memory_limit}</p>}
            </div>
          </div>
        </section>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/95 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
          <Link to="/admin" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-white dark:border-gray-700 dark:hover:bg-gray-900">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-gray-950 dark:hover:bg-cyan-400">
            {isSubmitting ? "Saving..." : isEditMode ? "Update Problem" : "Create Problem"}
          </button>
        </div>
      </form>
    </main>
  );
}
