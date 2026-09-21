import { useEffect, useRef, useState, useCallback } from 'react';
import { pdfjsLib } from '@/lib/pdfjs';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfFlipbookProps {
  url: string;
  className?: string;
}

const TRANSITION_MS = 550;

export function PdfFlipbook({ url, className }: PdfFlipbookProps) {
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const pageCache = useRef<Map<number, string>>(new Map());

  const [numPages, setNumPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [outgoing, setOutgoing] = useState<{ page: number; dir: 1 | -1 } | null>(null);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [, forceRender] = useState(0);

  const wheelLockRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderPage = useCallback(async (pageNumber: number) => {
    if (pageCache.current.has(pageNumber) || !docRef.current) return;
    const page = await docRef.current.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    pageCache.current.set(pageNumber, canvas.toDataURL('image/jpeg', 0.9));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setOutgoing(null);
    setAnimate(false);
    setCurrent(1);

    const load = async () => {
      const doc = await pdfjsLib.getDocument(url).promise;
      if (cancelled) return;
      docRef.current = doc;
      setNumPages(doc.numPages);
      await renderPage(1);
      if (cancelled) return;
      setCurrent(1);
      setLoading(false);
      renderPage(2);
    };

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      console.error('Recipe PDF load timed out');
      setError('This recipe is taking too long to load. Please try again shortly.');
      setLoading(false);
    }, 25000);

    load()
      .catch((err) => {
        console.error('Failed to load recipe PDF:', err);
        if (!cancelled) {
          setError('Could not load this recipe. Please try again shortly.');
          setLoading(false);
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      docRef.current?.destroy();
      docRef.current = null;
      pageCache.current.clear();
    };
  }, [url, renderPage]);

  const goTo = useCallback(
    async (target: number) => {
      if (target < 1 || target > numPages || target === current || outgoing || loading) return;
      await renderPage(target);
      const dir: 1 | -1 = target > current ? 1 : -1;
      setOutgoing({ page: current, dir });
      setCurrent(target);
      forceRender((n) => n + 1);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      renderPage(target + dir);
    },
    [current, numPages, outgoing, loading, renderPage]
  );

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => {
      setOutgoing(null);
      setAnimate(false);
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [animate]);

  // Keyboard paging only while the pointer is over the book (or it's
  // fullscreen), and never while typing in a field -- a global window
  // listener used to hijack arrow keys everywhere on the page.
  const hoveredRef = useRef(false);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) { setFullscreen(false); return; }
      if (!hoveredRef.current && !fullscreen) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(current - 1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo, fullscreen]);

  // Native non-passive wheel listener: React's onWheel can't reliably
  // preventDefault, which made the page scroll behind the book at the same
  // time as the pages turned. Every wheel event over the book is consumed;
  // the delta threshold only decides whether to turn a page.
  const frameRef = useRef<HTMLDivElement>(null);
  const goToRef = useRef(goTo);
  goToRef.current = goTo;
  const currentRef = useRef(current);
  currentRef.current = current;
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (wheelLockRef.current || Math.abs(e.deltaY) < 15) return;
      wheelLockRef.current = true;
      goToRef.current(e.deltaY > 0 ? currentRef.current + 1 : currentRef.current - 1);
      setTimeout(() => { wheelLockRef.current = false; }, TRANSITION_MS + 150);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [loading, error]);

  // Lock the page behind the fullscreen overlay.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <AlertCircle className="h-10 w-10 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      className={cn(
        'relative select-none',
        fullscreen && 'fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4',
        className
      )}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
    >
      <div
        ref={frameRef}
        className={cn(
          'relative w-full mx-auto rounded-xl overflow-hidden shadow-2xl bg-white',
          fullscreen ? 'max-w-6xl h-[85vh]' : 'max-w-6xl h-[70vh] md:h-[82vh]'
        )}
        style={{ perspective: '2000px', overscrollBehavior: 'contain' }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Base layer: always the current target page */}
            {pageCache.current.get(current) && (
              <img
                src={pageCache.current.get(current)}
                alt={`Page ${current}`}
                className="absolute inset-0 w-full h-full object-contain bg-white pointer-events-none"
                draggable={false}
              />
            )}

            {/* Outgoing layer: animates away vertically */}
            {outgoing && pageCache.current.get(outgoing.page) && (
              <img
                src={pageCache.current.get(outgoing.page)}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain bg-white pointer-events-none shadow-[0_-8px_30px_rgba(0,0,0,0.25)]"
                style={{
                  transformOrigin: outgoing.dir === 1 ? 'bottom center' : 'top center',
                  transform: animate
                    ? `translateY(${outgoing.dir === 1 ? '-100%' : '100%'}) rotateX(${outgoing.dir === 1 ? '-18deg' : '18deg'})`
                    : 'translateY(0) rotateX(0deg)',
                  transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.45, 0, 0.2, 1)`,
                  willChange: 'transform',
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {!loading && numPages > 0 && (
        <div className={cn('flex items-center gap-4 mt-4', fullscreen && 'text-white')}>
          <Button variant="outline" size="icon" onClick={() => goTo(current - 1)} disabled={current <= 1}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className={cn('text-sm font-medium tabular-nums', fullscreen ? 'text-white' : 'text-muted-foreground')}>
            Page {current} / {numPages}
          </span>
          <Button variant="outline" size="icon" onClick={() => goTo(current + 1)} disabled={current >= numPages}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setFullscreen((f) => !f)} className={fullscreen ? 'text-white hover:text-white hover:bg-white/10' : ''}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      )}
      {!loading && numPages > 0 && (
        <p className={cn('text-xs mt-2', fullscreen ? 'text-white/60' : 'text-muted-foreground')}>
          Scroll, use arrow keys, or the buttons above to turn the page
        </p>
      )}
    </div>
  );
}
