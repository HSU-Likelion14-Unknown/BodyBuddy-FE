import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import SplashPage from './pages/Splash/SplashPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모바일 레이아웃 설정 */}
        <Route element={<Layout />}>
          <Route path="/" element={<SplashPage />} />
          {/* <Route path="/onboarding" element={<OnboardingPage />} /> */}
          {/* <Route path="/home" element={<HomePage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
