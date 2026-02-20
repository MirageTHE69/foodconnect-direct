
-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_months INTEGER NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "Admins can manage plans"
ON public.subscription_plans
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'free_trial',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own subscriptions
CREATE POLICY "Users can insert own subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Seed subscription plans
INSERT INTO public.subscription_plans (name, price, duration_months, description, features, is_popular) VALUES
(
  'Starter Plan',
  500,
  2,
  'Perfect for exploring the platform and connecting with suppliers.',
  ARRAY['Browse all suppliers', 'Send enquiries', 'Access product catalog', 'Basic chat support', 'Save favorite products'],
  false
),
(
  'Annual Plan',
  5999,
  14,
  'Best value! Get 14 months of full access including 2 months free.',
  ARRAY['Everything in Starter', 'Priority supplier matching', 'Advanced analytics', 'Dedicated support', 'Early access to new features', 'Bulk enquiry tools', '2 months FREE bonus'],
  true
);

-- Grant all existing users an Annual Plan subscription for testing
INSERT INTO public.user_subscriptions (user_id, plan_id, status, starts_at, expires_at, payment_status)
SELECT 
  ur.user_id,
  (SELECT id FROM public.subscription_plans WHERE name = 'Annual Plan' LIMIT 1),
  'active',
  now(),
  now() + INTERVAL '14 months',
  'free_trial'
FROM public.user_roles ur
GROUP BY ur.user_id;
