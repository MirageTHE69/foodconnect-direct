import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-W03864RS6H';

/**
 * gtag's default config only sends a pageview on the initial script load
 * (see index.html, send_page_view: false). Since this is a single-page app,
 * every subsequent client-side route change is sent explicitly here so all
 * pages get tracked, not just the first one.
 */
export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
      page_location: window.location.href,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [location.pathname, location.search]);

  return null;
}
