import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useStore } from './store';

function App() {
  const brandMode = useStore((state) => state.brandMode);
  const setBrandMode = useStore((state) => state.setBrandMode);

  useEffect(() => {
    if (brandMode !== 'siemens-energy') {
      setBrandMode('siemens-energy');
      return;
    }

    document.documentElement.dataset.brand = 'siemens-energy';

    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      document.head.appendChild(favicon);
    }

    favicon.href = '/favicon-se.svg';
  }, [brandMode, setBrandMode]);

  return <RouterProvider router={router} />;
}

export default App;
