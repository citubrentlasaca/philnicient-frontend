import './App.css';
import AssessmentPage from './AssessmentPage/AssessmentPage.js';
import colors from './colors';
import InstructionsPage from './InstructionsPage/InstructionsPage.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<SignUpPage />} />
          <Route path='/' element={<PrivateRoute redirectTo="/login" component={Homepage} />} />
          <Route path='/instructions' element={<PrivateRoute redirectTo="/login" component={InstructionsPage} />} />
          <Route path="/assessment" element={<PrivateRoute redirectTo="/login" component={AssessmentPage} />} />
          <Route path="/results" element={<PrivateRoute redirectTo="/login" component={ResultsPage} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

const PrivateRoute = ({ component: Component, redirectTo }) => {
  const userDataString = sessionStorage.getItem('userData');
  const userData = JSON.parse(userDataString);
  const token = userData?.access_token;
  return token ? <Component /> : <Navigate to={redirectTo} />;
};
