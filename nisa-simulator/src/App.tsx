import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { ToastProvider } from './components/Toast';
import { SimulatorSection } from './components/simulator/SimulatorSection';
import { NisaExplainerSection } from './components/education/NisaExplainerSection';
import { hasShareParams } from './lib/params';

export default function App() {
  const shared = typeof window !== 'undefined' && hasShareParams(window.location.search);

  return (
    <ToastProvider>
      <Header />
      <main>
        <Hero compact={shared} />
        <SimulatorSection />
        <NisaExplainerSection />
      </main>
      <Footer />
    </ToastProvider>
  );
}
