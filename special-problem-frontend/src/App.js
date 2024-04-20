import AssessmentPage from './AssessmentPage/AssessmentPage.js';
import colors from './colors';
import InstructionsPage from './InstructionsPage/InstructionsPage.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResultsPage from './ResultsPage/ResultsPage.js';
import LoginPage from './LoginPage/LoginPage.js';
import SignUpPage from './SignUpPage/SignUpPage.js';
import Homepage from './Homepage/Homepage.js';
import ClassPage from './ClassPage/ClassPage.js';
import ForgotPasswordPage from './LoginPage/ForgotPasswordPage.js';
import LandingPage from './LandingPage/LandingPage.js';
import PageNotFound from './PageNotFound/PageNotFound.js';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import AccountManagementPage from './AccountManagement/AccountManagementPage.js';
import ContentManagementPage from './ContentManagement/ContentManagementPage.js';
import { PublicRoute, PrivateRoute } from './Components/RouteComponents.js';

function App() {
  return (
    <div className='vw-100 vh-100'
      style={{
        backgroundColor: colors.light
      }}
    >
      <Router>
        <Routes>
          <Route path='/' element={<PublicRoute redirectTo="/home" component={LandingPage} />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/home' element={<PrivateRoute redirectTo="/login" component={Homepage} />} />
          <Route path='/class/:classId' element={<PrivateRoute redirectTo="/login" component={ClassPage} />} />
          <Route path='/instructions' element={<PrivateRoute redirectTo="/login" component={InstructionsPage} />} />
          <Route path="/assessment/:assessmentId" element={<PrivateRoute redirectTo="/login" component={AssessmentPage} />} />
          <Route path="/results" element={<PrivateRoute redirectTo="/login" component={ResultsPage} />} />
          <Route path="/account-management" element={<PrivateRoute redirectTo="/login" component={AccountManagementPage} />} />
          <Route path='/content-management' element={<PrivateRoute redirectTo="/login" component={ContentManagementPage} />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </Router>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;