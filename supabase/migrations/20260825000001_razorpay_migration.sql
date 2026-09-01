-- Switches the automated payment provider from Cashfree to Razorpay.
-- No real customers ever completed a Cashfree payment (verified: all
-- payment_provider='cashfree' rows were this session's own test accounts,
-- already deleted), so this is a clean rename rather than a data migration.

ALTER TABLE public.user_subscriptions
  RENAME COLUMN cf_order_id TO gateway_order_id;

ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_payment_provider_check;

ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_payment_provider_check
    CHECK (payment_provider IN ('manual', 'razorpay'));

DROP INDEX IF EXISTS idx_user_subscriptions_cf_order_id;
CREATE UNIQUE INDEX idx_user_subscriptions_gateway_order_id
  ON public.user_subscriptions (gateway_order_id)
  WHERE gateway_order_id IS NOT NULL;
