
DO $$
DECLARE
  buyer_id uuid;
  admin_id uuid;
  starter_plan_id uuid;
BEGIN
  SELECT id INTO starter_plan_id FROM public.subscription_plans WHERE name = 'Starter Plan' LIMIT 1;

  -- BUYER TEST USER
  SELECT id INTO buyer_id FROM auth.users WHERE email = 'buyer.test@foodadda.in';
  IF buyer_id IS NULL THEN
    buyer_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', buyer_id, 'authenticated', 'authenticated',
      'buyer.test@foodadda.in', crypt('Buyer@12345', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Test Buyer"}'::jsonb, now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), buyer_id,
      jsonb_build_object('sub', buyer_id::text, 'email', 'buyer.test@foodadda.in', 'email_verified', true),
      'email', buyer_id::text, now(), now(), now());
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (buyer_id, 'buyer.test@foodadda.in', 'Test Buyer')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (buyer_id, 'buyer')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Active subscription valid 60 days
  DELETE FROM public.user_subscriptions WHERE user_id = buyer_id;
  INSERT INTO public.user_subscriptions (user_id, plan_id, status, starts_at, expires_at, payment_status)
  VALUES (buyer_id, starter_plan_id, 'active', now(), now() + interval '60 days', 'free_trial');

  -- ADMIN TEST USER
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin.test@foodadda.in';
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'admin.test@foodadda.in', crypt('Admin@12345', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Test Admin"}'::jsonb, now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'admin.test@foodadda.in', 'email_verified', true),
      'email', admin_id::text, now(), now(), now());
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (admin_id, 'admin.test@foodadda.in', 'Test Admin')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
