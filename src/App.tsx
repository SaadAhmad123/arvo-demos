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
      <Route path='/learn/arvo-event' element={<LearnPage />} />
      <Route path='/learn/arvo-contract' element={<LearnPage />} />
      <Route path='/learn/arvo-event-factory' element={<LearnPage />} />
      <Route path='/learn/arvo-event-handler' element={<LearnPage />} />
      <Route path='/learn/arvo-machine' element={<LearnPage />} />
      <Route path='/learn/arvo-orchestrator' element={<LearnPage />} />
      <Route path='/learn/arvo-resumable' element={<LearnPage />} />
      <Route path='/advanced' element={<NotFoundPage />} />
      <Route path='/404' element={<NotFoundPage />} />
      <Route path='*' element={<Navigate to={'/404'} replace />} />
    </Routes>
  );
};
