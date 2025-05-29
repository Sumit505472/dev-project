import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProblemList from './pages/problemlist';
import ProblemDetail from './pages/problemDetails';
import CodeEditor from './components/codeeditor';
import LoginPage from './pages/login';
import AddProblemForm from './components/admin/add_problem';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/admin/add-problem" element={<AddProblemForm />} />
      </Routes>
    </Router>
  );
}

export default App;
