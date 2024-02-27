import './App.css';
import AssessmentPage from './AssessmentPage/AssessmentPage.js';
import colors from './colors';
import InstructionsPage from './InstructionsPage/InstructionsPage.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResultsPage from './ResultsPage/ResultsPage.js';
import LoginPage from './LoginPage/LoginPage.js';
import SignUpPage from './SignUpPage/SignUpPage.js';
import Homepage from './Homepage/Homepage.js';

function App() {
  return (
    <div className='vw-100 vh-100'
      style={{
        backgroundColor: colors.light
      }}
    >
      <Router>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path='/register' element={<SignUpPage />} />
          <Route path='/home' element={<Homepage />} />
          <Route path='/instructions' element={<InstructionsPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
