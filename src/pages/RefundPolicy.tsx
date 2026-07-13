import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">for FoodAdda.in</p>

          <div className="prose prose-sm sm:prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <p>Thank you for subscribing to FoodAdda.in. As a subscription-based platform, we follow a strict no-refund policy for all subscription purchases. By subscribing to our services, you acknowledge and agree to the terms outlined below.</p>

            <h2>1. No Refund Policy</h2>
            <h3>1.1 Non-Refundable Payments:</h3>
            <ul>
              <li>Once a subscription is purchased and the payment is successfully processed, no refunds shall be issued under any circumstances.</li>
              <li>This includes but is not limited to early cancellation, non-usage, or dissatisfaction with the platform.</li>
            </ul>
            <h3>1.2 Subscription Renewal:</h3>
            <ul>
              <li>Users are responsible for managing their subscription renewals.</li>
              <li>If you do not wish to continue your subscription, you must cancel it before the renewal date to avoid automatic charges.</li>
              <li>No refunds will be provided for auto-renewed subscriptions.</li>
            </ul>
            <h3>1.3 Service Disruptions:</h3>
            <ul>
              <li>In the event of temporary service disruptions or maintenance, users are not entitled to refunds or credits.</li>
              <li>FoodAdda.in ensures that any planned maintenance or downtime is communicated in advance.</li>
            </ul>

            <h2>2. Exceptions</h2>
            <h3>2.1 Duplicate Payment:</h3>
            <ul>
              <li>In case of accidental duplicate payments, users may request a refund for the excess amount within 7 days of the transaction.</li>
              <li>The refund will be processed after verification and approval.</li>
            </ul>
            <h3>2.2 Unauthorized Transactions:</h3>
            <ul>
              <li>If a user suspects an unauthorized transaction, they must report it immediately to our support team at consult.ajaysant@gmail.com.</li>
              <li>Refunds for unauthorized payments are subject to investigation.</li>
            </ul>

            <h2>3. Cancellation Policy</h2>
            <p><strong>3.1</strong> Users may cancel their subscription at any time; however, no refunds will be provided for the remaining subscription period.</p>
            <p><strong>3.2</strong> Access to premium features will remain available until the end of the current billing cycle after cancellation.</p>

            <h2>4. Contact Us</h2>
            <p>For any queries regarding this Refund Policy, please reach out to us at <strong>info@foodadda.in</strong> or call <strong>9327228611</strong>.</p>

            <h2>5. Jurisdiction</h2>
            <p>Any disputes, grievances, or legal matters arising from this Refund Policy shall be subjected to the jurisdiction of Vadodara, Gujarat.</p>

            <p><em>By subscribing to FoodAdda.in, you agree to this No Refund Policy. We appreciate your understanding!</em></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
