import { useSystemTheme } from './hooks/useSystemTheme';
import './index.css';

export default () => {
  useSystemTheme();

  return (
    <div>
      <h1 className='text-3xl bg-primary text-on-primary'>Hello from Arvo</h1>
    </div>
  );
};
