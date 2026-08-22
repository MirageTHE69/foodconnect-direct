-- Adds Cashfree order linkage to user_subscriptions so the automated payment
-- path (create-payment-order + cashfree-webhook edge functions) can operate
-- alongside the existing manual admin-approval flow. No RLS policy changes:
-- both the initial insert and the activation update for Cashfree rows are
-- performed by edge functions using the service-role key, which bypasses
-- RLS entirely -- the client never inserts or updates these rows directly.

ALTER TABLE public.user_subscriptions
  ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'manual'
    CHECK (payment_provider IN ('manual', 'cashfree')),
  ADD COLUMN cf_order_id TEXT;

-- Cashfree order ids must be unique when present; NULL (manual rows) is
-- unconstrained via a partial unique index.
CREATE UNIQUE INDEX idx_user_subscriptions_cf_order_id
  ON public.user_subscriptions (cf_order_id)
  WHERE cf_order_id IS NOT NULL;

CREATE INDEX idx_user_subscriptions_payment_provider
  ON public.user_subscriptions (payment_provider);

-- Let the client watch its own subscription row flip to 'active' after the
-- Cashfree webhook fires server-side (see useSubscriptionActivationWatcher).
-- RLS already scopes SELECT to auth.uid() = user_id, so this only ever
-- streams a user's own row to them.
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;
