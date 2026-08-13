import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import MealAnalysisPage from './pages/meal-analysis/MealAnalysisPage';
import MealRecordPage from './pages/meal-record/MealRecordPage';
import MealResultPage from './pages/meal-result/MealResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모바일 레이아웃 설정 */}
        <Route element={<Layout />}>
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/home" element={<></>} />
          <Route path="/meals/new" element={<MealRecordPage />} />
          <Route path="/meals/analyzing" element={<MealAnalysisPage />} />
          <Route path="/meals/result" element={<MealResultPage />} />
          <Route path="/calendar" element={<></>} />
          <Route path="/mypage" element={<></>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
