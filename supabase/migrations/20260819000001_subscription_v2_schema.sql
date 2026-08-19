-- Subscription system rebuild: new plans/subscriptions schema.
-- Wipes the old placeholder subscription_plans/user_subscriptions tables and
-- replaces them with a category-credit + universal-tier model, and closes the
-- RLS hole that let a client self-insert an 'active' subscription.

CREATE TYPE public.business_category AS ENUM (
  'founders', 'women_enterprise', 'north_east_startups', 'micro_first_time', 'small_homemade_food'
);

CREATE TYPE public.plan_type AS ENUM ('free', 'category_credit', 'universal_tier');

DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  plan_type public.plan_type NOT NULL,
  business_category public.business_category,
  name TEXT NOT NULL,
  description TEXT,
  credits_per_month INTEGER,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_annual INTEGER NOT NULL DEFAULT 0,
  gst_percent NUMERIC NOT NULL DEFAULT 18,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'active', 'expired', 'cancelled', 'rejected')),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  amount_paid INTEGER,
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Closes the self-activation hole: a client can only ever insert a row for
-- themselves that is pending and unpaid. No status/payment_status other than
-- the defaults can be smuggled through an insert.
CREATE POLICY "Users can create pending subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'pending_payment' AND payment_status = 'unpaid'
  );

-- Deliberately no client-facing UPDATE policy: only admins can transition a
-- subscription to active/expired/cancelled/rejected.
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
