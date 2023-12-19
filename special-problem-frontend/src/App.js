import './App.css';
import AssessmentPage from './AssessmentPage/AssessmentPage.js';
import colors from './colors';
import LandingPage from './LandingPage/LandingPage.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <div className='vw-100 vh-100'
      style={{
        backgroundColor: colors.light
      }}
    >
      <Router>
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
