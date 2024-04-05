import AssessmentPage from './AssessmentPage/AssessmentPage.js';
import colors from './colors';
import InstructionsPage from './InstructionsPage/InstructionsPage.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResultsPage from './ResultsPage/ResultsPage.js';
import LoginPage from './LoginPage/LoginPage.js';
import SignUpPage from './SignUpPage/SignUpPage.js';
import Homepage from './Homepage/Homepage.js';
import ClassPage from './ClassPage/ClassPage.js';
import ForgotPasswordPage from './LoginPage/ForgotPasswordPage.js';
import LandingPage from './LandingPage/LandingPage.js';

function App() {
  const userDataString = sessionStorage.getItem('userData');
  const userData = JSON.parse(userDataString);
  const isLoggedIn = userData?.access_token;

  return (
    <div className='vw-100 vh-100'
      style={{
        backgroundColor: colors.light
      }}
    >
      <Router>
        <Routes>
          <Route path='/' element={isLoggedIn ? <Homepage /> : <LandingPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/forgotpassword' element={<ForgotPasswordPage />} />
          <Route path='/class/:classId' element={<PrivateRoute redirectTo="/login" component={ClassPage} />} />
          <Route path='/instructions' element={<PrivateRoute redirectTo="/login" component={InstructionsPage} />} />
          <Route path="/assessment/:assessmentId" element={<PrivateRoute redirectTo="/login" component={AssessmentPage} />} />
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
