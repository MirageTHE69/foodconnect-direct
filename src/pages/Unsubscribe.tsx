import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

// Requires an explicit click rather than unsubscribing on page load, so
// email scanners that pre-open links can't unsubscribe someone by accident.
export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');

  useEffect(() => {
    document.title = 'Unsubscribe | FoodAdda';
  }, []);

  const unsubscribe = async () => {
    setState('working');
    const { data, error } = await supabase.functions.invoke('outreach-unsubscribe', { body: { token } });
    setState(error || data?.error ? 'error' : 'done');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16 px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            {state === 'done' ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                <h1 className="text-2xl font-bold">You're unsubscribed</h1>
                <p className="text-muted-foreground">You won't receive any more emails from FoodAdda at this address.</p>
                <Button asChild variant="outline"><Link to="/">Go to FoodAdda</Link></Button>
              </>
            ) : (
              <>
                <MailX className="h-12 w-12 text-primary mx-auto" />
                <h1 className="text-2xl font-bold">Unsubscribe from FoodAdda emails?</h1>
                <p className="text-muted-foreground">
                  {token ? "Confirm below and we'll stop emailing you." : 'This unsubscribe link is incomplete. Please use the link from the email.'}
                </p>
                {state === 'error' && (
                  <p className="text-sm text-destructive">
                    That didn't work. Please try again, or email info@foodadda.in and we'll remove you.
                  </p>
                )}
                <Button onClick={unsubscribe} disabled={!token || state === 'working'}>
                  {state === 'working' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Unsubscribe
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
