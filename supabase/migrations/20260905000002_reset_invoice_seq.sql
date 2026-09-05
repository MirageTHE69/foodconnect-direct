-- Two invoice numbers (00001, 00002) were consumed by test rows while
-- verifying the GST invoicing feature before any real customer used it.
-- Reset so the first genuine invoice starts at 00001.
ALTER SEQUENCE public.invoice_number_seq RESTART WITH 1;
