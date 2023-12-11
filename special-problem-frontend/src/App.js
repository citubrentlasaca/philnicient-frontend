import './App.css';
import colors from './colors';
import LandingPage from './LandingPage/LandingPage.js';

function App() {
  return (
    <div className='vw-100 vh-100'
      style={{
        backgroundColor: colors.light
      }}
    >
      <LandingPage />
    </div>
  );
}

export default App;
