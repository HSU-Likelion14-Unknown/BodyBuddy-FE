import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import MealAnalysisPage from './pages/meal-analysis/MealAnalysisPage';
import MealRecommendationPage from './pages/meal-recommendation/MealRecommendationPage';
import MealRecordPage from './pages/meal-record/MealRecordPage';
import MealResultPage from './pages/meal-result/MealResultPage';
import SplashPage from './pages/Splash/SplashPage';
import OnboardingPage1 from './pages/Onboarding/OnboardingPage1';
import OnboardingPage2 from './pages/Onboarding/OnboardingPage2';
import OnboardingPage3 from './pages/Onboarding/OnboardingPage3';
import HomePage from './pages/home/HomePage';
import ShareRoomInvitePage from './pages/share-room/ShareRoomInvitePage';
import ShareRoomPage from './pages/share-room/ShareRoomPage';
import CalendarPage from './pages/Calendar/CalendarPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모바일 레이아웃 설정 */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/share-room/invite/:code"
            element={<ShareRoomInvitePage />}
          />
          <Route path="/share-room/:roomId" element={<ShareRoomPage />} />
          <Route path="/meals/new" element={<MealRecordPage />} />
          <Route path="/meals/analyzing" element={<MealAnalysisPage />} />
          <Route path="/meals/result" element={<MealResultPage />} />
          <Route
            path="/meals/recommendation"
            element={<MealRecommendationPage />}
          />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/mypage" element={<></>} />
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
