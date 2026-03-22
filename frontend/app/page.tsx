import './globals.css';
import Dashboard from './Dashboard';

export const metadata = {
  title: 'Weather Dashboard',
  description: 'Weather monitoring and forecasting',
};

export default function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
