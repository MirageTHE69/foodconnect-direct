import { useNavigate, useLocation } from 'react-router-dom';

// Landing-page sections (#how-it-works, #categories, etc.) only exist on
// "/". From any other page, navigate home first, then scroll to the anchor
// once the landing page has mounted.
export function useAnchorNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (anchor: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + anchor);
      setTimeout(() => {
        document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }
  };
}
