import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useStore } from './store';

const faviconMap = {
  default: '/favicon.svg',
  'siemens-energy': '/favicon-se.svg',
} as const;

function App() {
  const brandMode = useStore((state) => state.brandMode);

  useEffect(() => {
    document.documentElement.dataset.brand = brandMode;

    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      document.head.appendChild(favicon);
    }

    favicon.href = faviconMap[brandMode];
  }, [brandMode]);

  return <RouterProvider router={router} />;
}

export default App;
