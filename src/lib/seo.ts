interface PageMeta {
  title: string;
  description: string;
  image?: string | null;
  /** Structured data (schema.org) added as a JSON-LD script. */
  jsonLd?: Record<string, unknown>;
}

const SEO_ATTR = 'data-page-seo';

function upsertMeta(attr: 'name' | 'property', key: string, content: string, restore: (() => void)[]) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (tag) {
    const previous = tag.getAttribute('content');
    const el = tag;
    restore.push(() => { if (previous !== null) el.setAttribute('content', previous); });
  } else {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
    const el = tag;
    restore.push(() => el.remove());
  }
  tag.setAttribute('content', content);
}

/** Truncates to a search-snippet friendly length on a word boundary. */
export function snippet(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

/**
 * Sets title, description, Open Graph tags and optional JSON-LD for the
 * current page. Returns a cleanup that puts the site defaults back, for use
 * as a useEffect cleanup.
 */
export function setPageMeta({ title, description, image, jsonLd }: PageMeta): () => void {
  const restore: (() => void)[] = [];
  const previousTitle = document.title;
  restore.push(() => { document.title = previousTitle; });
  document.title = title;

  const desc = snippet(description);
  upsertMeta('name', 'description', desc, restore);
  upsertMeta('property', 'og:title', title, restore);
  upsertMeta('property', 'og:description', desc, restore);
  upsertMeta('property', 'og:url', window.location.href, restore);
  upsertMeta('name', 'twitter:title', title, restore);
  upsertMeta('name', 'twitter:description', desc, restore);
  if (image) {
    upsertMeta('property', 'og:image', image, restore);
    upsertMeta('name', 'twitter:image', image, restore);
  }

  if (jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(SEO_ATTR, '');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    restore.push(() => script.remove());
  }

  return () => restore.reverse().forEach((fn) => fn());
}
