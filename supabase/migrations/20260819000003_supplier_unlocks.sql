-- Credit-unlock ledger: tracks which suppliers a buyer has unlocked in the
-- current billing period (1 credit = 1 unlock/month on a category-credit
-- plan; unlimited on a universal tier). Writes only go through the
-- unlock_supplier() RPC below, never a direct client insert, so credit
-- limits are enforced server-side.

CREATE TABLE public.supplier_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.supplier_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  billing_period_start DATE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (buyer_user_id, supplier_id, billing_period_start)
);

ALTER TABLE public.supplier_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks" ON public.supplier_unlocks
  FOR SELECT USING (auth.uid() = buyer_user_id);

CREATE POLICY "Admins can view all unlocks" ON public.supplier_unlocks
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

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
