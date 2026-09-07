import { pdfjsLib } from '@/lib/pdfjs';

/** Renders a PDF's first page to a JPEG blob, for use as a card thumbnail. */
export async function renderPdfFirstPageAsBlob(file: File, scale = 1.5): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  try {
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to generate thumbnail'))), 'image/jpeg', 0.85);
    });
  } finally {
    await doc.destroy();
  }
}
