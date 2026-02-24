
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SurveyForm from './pages/SurveyForm';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SurveyForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
