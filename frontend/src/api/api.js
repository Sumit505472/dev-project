import axios from 'axios';

const API = axios.create({
  baseURL: VITE_BACKEND_URL,
});
export const registerUser = (userData) => API.post('/register', userData);

export const fetchProblems = () => API.get('/problem');
export const fetchProblemById = (id) => API.get(`/problem/${id}`);
export const runCode = (codeData) => API.post('/run', codeData);

