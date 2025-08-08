import { Navigate, Route, Routes } from 'react-router';
import { useSystemTheme } from './hooks/useSystemTheme';
import './index.css';
import { HomePage } from './pages/Home';
import { NotFoundPage } from './pages/404';

export default () => {
  useSystemTheme();

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path='/404' element={<NotFoundPage />} />
      <Route path='*' element={<Navigate to={'/404'} replace />} />
    </Routes>
  );
};
