import { Navigate, Route, Routes } from 'react-router';
import { useSystemTheme } from './hooks/useSystemTheme';
import './index.css';
import { HomePage } from './pages/Home';
import { NotFoundPage } from './pages/404';
import { LearnPage } from './pages/Learn';

export default () => {
  useSystemTheme();

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path='/learn' element={<LearnPage />} />
      <Route path='/404' element={<NotFoundPage />} />
      <Route path='*' element={<Navigate to={'/404'} replace />} />
    </Routes>
  );
};
