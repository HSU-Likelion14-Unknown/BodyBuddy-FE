import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import SplashPage from './pages/Splash/SplashPage';
import OnboardingPage1 from './pages/Onboarding/OnboardingPage1';
import OnboardingPage2 from './pages/Onboarding/OnboardingPage2';
import OnboardingPage3 from './pages/Onboarding/OnboardingPage3';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모바일 레이아웃 설정 */}
        <Route element={<Layout />}>
          <Route path="/" element={<SplashPage />} />
          <Route path="/onboarding/1" element={<OnboardingPage1 />} />
          <Route path="/onboarding/2" element={<OnboardingPage2 />} />
          <Route path="/onboarding/3" element={<OnboardingPage3 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
