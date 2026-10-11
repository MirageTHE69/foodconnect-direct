-- Subscription model change: there is no free plan any more. Every account
-- gets one free month of full access at sign-up; after that a paid plan is
-- mandatory (enforced in the app by ProtectedRoute).
--
-- The free month is an ordinary user_subscriptions row on the B2B & B2C plan
-- flagged is_trial, so every existing access check (useSubscription,
-- unlock_supplier) treats it as full access with no special cases.

ALTER TABLE public.user_subscriptions
  ADD COLUMN is_trial BOOLEAN NOT NULL DEFAULT false;

-- One free month per account, ever.
CREATE UNIQUE INDEX idx_user_subscriptions_one_trial
  ON public.user_subscriptions (user_id) WHERE is_trial;

-- Clients must never be able to insert a trial row themselves.
DROP POLICY IF EXISTS "Users can create pending subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can create pending subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'pending_payment' AND payment_status = 'unpaid' AND is_trial = false
  );

CREATE OR REPLACE FUNCTION public.grant_free_trial(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan_id UUID;
BEGIN
  SELECT id INTO _plan_id FROM public.subscription_plans WHERE code = 'universal_b2b_b2c';
  IF _plan_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.user_subscriptions
    (user_id, plan_id, billing_cycle, status, payment_status, payment_provider,
     amount_paid, starts_at, expires_at, activated_at, is_trial)
  VALUES
    (_user_id, _plan_id, 'monthly', 'active', 'unpaid', 'manual',
     0, now(), now() + interval '1 month', now(), true)
  ON CONFLICT (user_id) WHERE is_trial DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_free_trial(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Never let a trial problem block account creation.
  BEGIN
    PERFORM public.grant_free_trial(NEW.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'grant_free_trial failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();

-- Existing accounts: the free month starts today for everyone who has no
-- active plan, so nobody is locked out without warning.
DO $$
DECLARE
  _u RECORD;
BEGIN
  FOR _u IN
    SELECT u.id FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_subscriptions s
      WHERE s.user_id = u.id AND s.status = 'active' AND s.expires_at > now()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin'
    )
  LOOP
    PERFORM public.grant_free_trial(_u.id);
  END LOOP;
END;
$$;

-- Small Homemade Food was the only free plan; it is now a paid credit plan.
UPDATE public.subscription_plans
SET code = 'shf_5',
    plan_type = 'category_credit',
    name = 'Small Homemade Food — 5 Credits/Month',
    description = 'Showcase products on site; 5 credits'' worth of company detail unlocked, rest blurred.',
    credits_per_month = 5,
    price_monthly = 236,
    price_annual = 2832
WHERE code = 'shf_free';

-- A plan bought during the free month starts when the free month ends
-- (starts_at in the future), so only count subscriptions that have started.
CREATE OR REPLACE FUNCTION public.unlock_supplier(_supplier_id UUID)
RETURNS TABLE(unlocked BOOLEAN, credits_remaining INTEGER, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _sub RECORD;
  _period DATE := date_trunc('month', now())::date;
  _used INTEGER;
  _already BOOLEAN;
BEGIN
  IF _user_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'not_authenticated';
    RETURN;
  END IF;

  SELECT us.id, sp.plan_type, sp.credits_per_month
  INTO _sub
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = _user_id AND us.status = 'active' AND us.expires_at > now()
    AND (us.starts_at IS NULL OR us.starts_at <= now())
  ORDER BY us.expires_at DESC
  LIMIT 1;

  IF _sub IS NULL THEN
    RETURN QUERY SELECT false, 0, 'no_active_subscription';
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.supplier_unlocks
    WHERE buyer_user_id = _user_id AND supplier_id = _supplier_id AND billing_period_start = _period
  ) INTO _already;

  IF _already THEN
    RETURN QUERY SELECT true, 999, 'already_unlocked';
    RETURN;
  END IF;

  IF _sub.plan_type = 'universal_tier' THEN
    INSERT INTO public.supplier_unlocks (buyer_user_id, supplier_id, subscription_id, billing_period_start)
    VALUES (_user_id, _supplier_id, _sub.id, _period);
    RETURN QUERY SELECT true, -1, 'unlimited';
    RETURN;
  END IF;

  SELECT count(*) INTO _used
  FROM public.supplier_unlocks
  WHERE buyer_user_id = _user_id AND billing_period_start = _period;

  IF _sub.credits_per_month IS NULL OR _used >= _sub.credits_per_month THEN
    RETURN QUERY SELECT false, 0, 'limit_reached';
    RETURN;
  END IF;

  INSERT INTO public.supplier_unlocks (buyer_user_id, supplier_id, subscription_id, billing_period_start)
  VALUES (_user_id, _supplier_id, _sub.id, _period);

  RETURN QUERY SELECT true, (_sub.credits_per_month - _used - 1), 'ok';
END;
$$;
