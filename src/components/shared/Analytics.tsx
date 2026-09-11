import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-W03864RS6H';

/**
 * gtag's default config (index.html) auto-tracks whichever page the browser
 * actually lands on first -- home or a deep link. Since this is a
 * single-page app, every route change AFTER that first load happens via the
 * History API with no real page load, so gtag never sees it on its own;
 * this fires an explicit page_view for each one.
 *
 * The first render is skipped on purpose: firing here too would tell gtag
 * about a page_view whose page_location already matches what the browser
 * is sitting on, which gtag silently treats as a no-op duplicate of the
 * auto-tracked hit and drops -- so relying on it for the first page
 * (as an earlier version of this file did) silently dropped tracking for
 * every direct/deep-linked page load, e.g. someone opening /jobs directly.
 */
export function Analytics() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
