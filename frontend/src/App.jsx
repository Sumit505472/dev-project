import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import ProblemList from './pages/problemlist';
import ProblemDetail from './pages/problemDetails';
import LoginPage from './pages/login';
import AddProblemForm from './components/addproblem';
import Compiler from './pages/compiler';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/addproblem" element={<AddProblemForm />} />
        
        <Route path="/*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
