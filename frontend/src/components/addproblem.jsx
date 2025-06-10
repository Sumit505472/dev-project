import { useState } from 'react';
import axios from 'axios';

export default function AddProblemForm() {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: '',
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    note: '',
    tags: '',
    question_number: '',
    test_cases: [{ input: '', output: '' }],
  });
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, e) => {
    const updatedTestCases = [...formData.test_cases];
    updatedTestCases[index][e.target.name] = e.target.value;
    setFormData({ ...formData, test_cases: updatedTestCases });
  };

  const addTestCase = () => {
    setFormData({ ...formData, test_cases: [...formData.test_cases, { input: '', output: '' }] });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      console.log(formData);
    const processedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()), // ✅ convert tags to array
      };
    // Call API to submit formDataA
        axios.post(`${import.meta.env.VITE_BACKEND_URL}/add`, formData)
      .then(response => {
        console.log('Problem added successfully:', response.data);
      })
      .catch(error => {
        console.error('Error adding problem:', error);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="border p-2" />
        <input name="difficulty" value={formData.difficulty} onChange={handleChange} placeholder="Difficulty" className="border p-2" />
        <input name="question_number" value={formData.question_number} onChange={handleChange} placeholder="Question Number" className="border p-2" />
      </div>

      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 h-28" />
      
      <div className="grid grid-cols-2 gap-4">
        <textarea name="input_format" value={formData.input_format} onChange={handleChange} placeholder="Input Format" className="border p-2 h-20" />
        <textarea name="output_format" value={formData.output_format} onChange={handleChange} placeholder="Output Format" className="border p-2 h-20" />
        <textarea name="constraints" value={formData.constraints} onChange={handleChange} placeholder="Constraints" className="border p-2 h-20" />
        <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="border p-2" />
      </div>

      <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Note (optional)" className="w-full border p-2 h-16" />

      <div>
        <h3 className="text-lg font-semibold mb-2">Test Cases</h3>
        {formData.test_cases.map((tc, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-2">
            <textarea
              name="input"
              value={tc.input}
              onChange={(e) => handleTestCaseChange(index, e)}
              placeholder="Input"
              className="border p-2 h-20"
            />
            <textarea
              name="output"
              value={tc.output}
              onChange={(e) => handleTestCaseChange(index, e)}
              placeholder="Output"
              className="border p-2 h-20"
            />
          </div>
        ))}
        <button type="button" onClick={addTestCase} className="text-blue-600 mt-2">Add More Test Case</button>
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Problem</button>
    </form>
  );
}
