import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionPlans, type SubscriptionPlan } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Utensils, ShoppingBag, Store, Loader2, Eye, EyeOff, ArrowLeft, ArrowRight, Check, Star } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type UserRole = 'buyer' | 'supplier';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const preSelectedPlanId = searchParams.get('plan');

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(preSelectedPlanId ? 2 : 1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(preSelectedPlanId);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const { signIn, signUp, user, userRole, loading } = useAuth();
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If plan is in URL, auto switch to signup
  useEffect(() => {
    if (preSelectedPlanId) {
      setActiveTab('signup');
    }
  }, [preSelectedPlanId]);

  // Redirect authenticated users (but not during signup step 3 — user needs to activate subscription first)
  useEffect(() => {
    if (!loading && user && userRole) {
      if (activeTab === 'signup' && signupStep === 3) return;
      const redirectPath = userRole === 'admin' ? '/admin' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, userRole, navigate, activeTab, signupStep]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};
    try { emailSchema.parse(email); } catch (err) { if (err instanceof z.ZodError) newErrors.email = err.errors[0].message; }
    try { passwordSchema.parse(password); } catch (err) { if (err instanceof z.ZodError) newErrors.password = err.errors[0].message; }
    if (activeTab === 'signup' && !fullName.trim()) newErrors.fullName = 'Please enter your full name';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message === 'Invalid login credentials' ? 'Invalid email or password.' : error.message });
    } else {
      toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    const { error } = await signUp(email, password, fullName, role);
    if (error) {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Signup Failed', description: error.message.includes('User already registered') ? 'This email is already registered.' : error.message });
    } else {
      // Move to confirmation step, keep isLoading false so user can click "Start Free Trial"
      setSignupStep(3);
      setIsLoading(false);
    }
  };

  const handleActivateSubscription = async () => {
    if (!selectedPlanId) return;
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    setIsLoading(true);
    try {
      // Wait for user to be available (auth state may still be updating after signup)
      let currentUser = user;
      if (!currentUser) {
        const { data } = await supabase.auth.getUser();
        currentUser = data.user;
      }
      if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please wait a moment and try again — your account is still being set up.' });
        setIsLoading(false);
        return;
      }

      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: currentUser.id,
          plan_id: plan.id,
          status: 'active',
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_status: 'free_trial',
        });

      if (error) throw error;

      toast({ title: 'Welcome to FoodAdda!', description: 'Your subscription is active. Redirecting...' });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to activate subscription.' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="p-4">
        <Button variant="ghost" onClick={() => signupStep > 1 && activeTab === 'signup' && signupStep < 3 ? setSignupStep((signupStep - 1) as 1 | 2) : navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {signupStep > 1 && activeTab === 'signup' && signupStep < 3 ? 'Back' : 'Back to Home'}
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Utensils className="w-10 h-10 text-primary" />
              <span className="text-3xl font-bold text-foreground">
                Food<span className="text-primary">Adda</span>
              </span>
            </div>
            <p className="text-muted-foreground">Connect with the food industry</p>
          </div>

          <Card className="border-2 shadow-xl">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'signup'); setSignupStep(preSelectedPlanId ? 2 : 1); }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? 'border-destructive pr-10' : 'pr-10'} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</> : 'Login'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                {/* Step indicator */}
                <div className="px-6 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          signupStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {signupStep > step ? <Check className="w-4 h-4" /> : step}
                        </div>
                        {step < 3 && <div className={`w-16 sm:w-24 h-0.5 mx-1 ${signupStep > step ? 'bg-primary' : 'bg-muted'}`} />}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Plan</span>
                    <span>Account</span>
                    <span>Confirm</span>
                  </div>
                </div>

                {/* Step 1: Choose Plan */}
                {signupStep === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle>Choose Your Plan</CardTitle>
                      <CardDescription>Select a subscription plan to get started</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {plansLoading ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                      ) : (
                        plans.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPlanId === plan.id
                                ? 'border-primary bg-primary/5 shadow-soft'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            {plan.is_popular && (
                              <Badge className="absolute -top-2.5 right-3 gradient-primary text-primary-foreground text-[10px] gap-1">
                                <Star className="w-2.5 h-2.5 fill-current" /> POPULAR
                              </Badge>
                            )}
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-foreground">{plan.name}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-extrabold text-foreground">₹{plan.price.toLocaleString('en-IN')}</span>
                                <p className="text-xs text-muted-foreground">/ {plan.duration_months} mo</p>
                              </div>
                            </div>
                            {plan.is_popular && (
                              <p className="text-xs font-semibold text-primary mt-2">🎉 2 months FREE!</p>
                            )}
                          </div>
                        ))
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" disabled={!selectedPlanId} onClick={() => setSignupStep(2)}>
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </>
                )}

                {/* Step 2: Create Account */}
                {signupStep === 2 && (
                  <form onSubmit={handleSignup}>
                    <CardHeader>
                      <CardTitle>Create Account</CardTitle>
                      <CardDescription>
                        {selectedPlan && <span className="text-primary font-medium">{selectedPlan.name}</span>}
                        {' — '}Fill in your details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label>I am a...</Label>
                        <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="grid grid-cols-2 gap-4">
                          <div>
                            <RadioGroupItem value="buyer" id="buyer" className="peer sr-only" />
                            <Label htmlFor="buyer" className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                              <ShoppingBag className="w-6 h-6 mb-2" />
                              <span className="font-semibold">Buyer</span>
                              <span className="text-xs text-muted-foreground text-center mt-1">Restaurants, Hotels, Retailers</span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="supplier" id="supplier" className="peer sr-only" />
                            <Label htmlFor="supplier" className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                              <Store className="w-6 h-6 mb-2" />
                              <span className="font-semibold">Supplier</span>
                              <span className="text-xs text-muted-foreground text-center mt-1">Manufacturers, Brands</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className={errors.fullName ? 'border-destructive' : ''} />
                        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? 'border-destructive pr-10' : 'pr-10'} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        By signing up, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </CardFooter>
                  </form>
                )}

                {/* Step 3: Confirm Subscription */}
                {signupStep === 3 && selectedPlan && (
                  <>
                    <CardHeader>
                      <CardTitle>Confirm Your Plan</CardTitle>
                      <CardDescription>Review your selection and activate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-foreground">{selectedPlan.name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedPlan.duration_months} months access</p>
                          </div>
                          <span className="text-2xl font-extrabold text-foreground">₹{selectedPlan.price.toLocaleString('en-IN')}</span>
                        </div>
                        <ul className="mt-4 space-y-2">
                          {selectedPlan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground">
                          💳 Payment gateway coming soon. Currently activating as <strong>Free Trial</strong>.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" size="lg" onClick={handleActivateSubscription} disabled={isLoading}>
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Activating...</> : 'Start Free Trial'}
                      </Button>
                    </CardFooter>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
