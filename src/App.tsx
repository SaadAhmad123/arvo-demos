import { Navigate, Route, Routes } from 'react-router';
import { useSystemTheme } from './hooks/useSystemTheme';
import './index.css';
import { HomePage } from './pages/Home';
import { NotFoundPage } from './pages/404';
import { LearnPage } from './pages/Learn';
import { ArvoEventPage } from './pages/Learn/pages/ArvoEvent';
import { AdvancedPage } from './pages/Advanced';
import { ArvoEventDataFieldDeepDivePage } from './pages/Advanced/pages/ArvoEventDataFieldDeepDive';
import { EventRoutingAndBrokersPage } from './pages/Advanced/pages/EventRoutingAndBrokers';
import { ArvoAgenticParadigmPage } from './pages/Advanced/pages/ArvoAgenticParadigm';
import { ArvoContractPage } from './pages/Learn/pages/ArvoContract';
import { ArvoEventFactoryPage } from './pages/Learn/pages/ArvoEventFactory';
import { ArvoEventHandlerPage } from './pages/Learn/pages/ArvoEventHandler';

export default () => {
  useSystemTheme();

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path='/learn' element={<LearnPage />} />
      <Route path='/learn/arvo-event' element={<ArvoEventPage />} />
      <Route path='/learn/arvo-contract' element={<ArvoContractPage />} />
      <Route path='/learn/arvo-event-factory' element={<ArvoEventFactoryPage />} />
      <Route path='/learn/arvo-event-handler' element={<ArvoEventHandlerPage />} />
      <Route path='/learn/arvo-machine' element={<LearnPage />} />
      <Route path='/learn/arvo-orchestrator' element={<LearnPage />} />
      <Route path='/learn/arvo-resumable' element={<LearnPage />} />
      <Route path='/advanced' element={<AdvancedPage />} />
      <Route path='/advanced/arvo-event-data-field-deep-dive' element={<ArvoEventDataFieldDeepDivePage />} />
      <Route path='/advanced/event-routing-and-brokers' element={<EventRoutingAndBrokersPage />} />
      <Route path='/advanced/arvo-agentic-resumables' element={<ArvoAgenticParadigmPage />} />
      <Route path='/advanced/error-boundaries' element={<AdvancedPage />} />
      <Route path='/advanced/multi-domain-broadcasting' element={<AdvancedPage />} />
      <Route path='/404' element={<NotFoundPage />} />
      <Route path='*' element={<Navigate to={'/404'} replace />} />
    </Routes>
  );
};
