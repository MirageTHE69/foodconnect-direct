import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-8">for FoodAdda.in — Effective Date: 01/11/2025</p>

          <div className="prose prose-sm sm:prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <p>Welcome to FoodAdda.in! These Terms and Conditions ("Terms") govern your use of our subscription-based platform for food-related sourcing, catering to B2B, B2C, and HoReCa, Franchise and food related jobs segments. By accessing or using FoodAdda.in, you agree to be bound by these Terms.</p>

            <h2>1. Definitions</h2>
            <p><strong>1.1</strong> "Platform" refers to FoodAdda.in, including its website, mobile applications, and services.</p>
            <p><strong>1.2</strong> "User" refers to any individual or business registered on the Platform, including buyers, sellers, and subscribers.</p>
            <p><strong>1.3</strong> "Subscription" refers to the paid membership plan that grants User's access to specific features and services.</p>
            <p><strong>1.4</strong> "HoReCa" refers to businesses in the Hotels, Restaurants, and Catering industry.</p>
            <p><strong>1.5</strong> "B2B" refers to Business-to-Business transactions.</p>
            <p><strong>1.6</strong> "B2C" refers to Business-to-Consumer transactions.</p>

            <h2>2. Eligibility</h2>
            <p><strong>2.1</strong> Users must be at least 18 years old or legally registered business entities.</p>
            <p><strong>2.2</strong> By using FoodAdda.in, Users confirm that they have the authority to enter into contracts.</p>

            <h2>3. Subscription and Payment</h2>
            <p><strong>3.1</strong> Subscription Plans: Users can choose from multiple subscription plans with varying features and durations.</p>
            <p><strong>3.2</strong> Payment Terms: All payments must be made online via approved payment gateways.</p>
            <p><strong>3.3</strong> Renewals and Cancellations: Subscriptions renew automatically unless cancelled before the renewal date.</p>
            <p><strong>3.4</strong> Refund Policy: Payments are non-refundable, except in cases of technical errors or unauthorized transactions.</p>

            <h2>4. User Obligations</h2>
            <p><strong>4.1</strong> Users agree to provide accurate business and contact information.</p>
            <p><strong>4.2</strong> Users shall not engage in fraudulent transactions, misrepresentation, or any illegal activities.</p>
            <p><strong>4.3</strong> Sellers must ensure product quality, legal compliance, and timely delivery.</p>
            <p><strong>4.4</strong> Buyers are responsible for verifying product quality before purchase.</p>

            <h2>5. Platform Usage</h2>
            <p><strong>5.1</strong> FoodAdda.in acts as an intermediary and is not liable for transactions between Users.</p>
            <p><strong>5.2</strong> The Platform reserves the right to remove content, listings, or Users violating these Terms.</p>
            <p><strong>5.3</strong> Users must not upload misleading, offensive, or copyrighted content.</p>

            <h2>6. Code of Conduct</h2>
            <p><strong>6.1</strong> Users must use the Platform solely for legitimate business purposes and comply with all applicable laws and regulations.</p>
            <p><strong>6.2</strong> Businesses registering on FoodAdda.in must have all necessary statutory registrations, including GST, FSSAI, Shops &amp; Establishment Act, and other relevant licenses.</p>
            <p><strong>6.3</strong> Users shall not engage in fraudulent, misleading, or unethical business practices.</p>
            <p><strong>6.4</strong> All transactions conducted through the Platform must comply with taxation laws, trade regulations, and business ethics.</p>
            <p><strong>6.5</strong> Users violating the Code of Conduct may face account suspension or termination without prior notice.</p>

            <h2>7. Intellectual Property</h2>
            <p><strong>7.1</strong> All trademarks, logos, and content on FoodAdda.in are owned by the Platform and may not be copied without permission.</p>
            <p><strong>7.2</strong> Users retain rights to their uploaded content but grant the Platform a non-exclusive license to display it.</p>

            <h2>8. Limitation of Liability</h2>
            <p><strong>8.1</strong> FoodAdda.in is not responsible for:</p>
            <ul>
              <li>Product defects or delivery delays.</li>
              <li>Disputes between Users.</li>
              <li>Financial losses or damages due to third-party transactions.</li>
            </ul>
            <p><strong>8.2</strong> The Platform's liability is limited to the subscription amount paid by the User.</p>

            <h2>9. Termination</h2>
            <p><strong>9.1</strong> The Platform reserves the right to terminate accounts for:</p>
            <ul>
              <li>Breach of these Terms.</li>
              <li>Fraudulent activities.</li>
              <li>Non-payment of subscription fees.</li>
            </ul>
            <p><strong>9.2</strong> Users may deactivate their accounts at any time, but no refunds shall be provided.</p>

            <h2>10. Governing Law &amp; Dispute Resolution</h2>
            <p><strong>10.1</strong> These Terms are governed by Indian law.</p>
            <p><strong>10.2</strong> Any disputes shall be resolved through mediation, failing which they shall be subject to arbitration under the Arbitration and Conciliation Act, 1996.</p>
            <p><strong>10.3</strong> The jurisdiction for legal disputes shall be Vadodara, Gujarat.</p>

            <h2>11. Miscellaneous</h2>
            <p><strong>11.1 Force Majeure:</strong> FoodAdda.in is not liable for disruptions due to unforeseen circumstances like natural disasters, cyberattacks, or government regulations.</p>
            <p><strong>11.2 Amendments:</strong> The Platform may update these Terms from time to time, and Users will be notified of significant changes.</p>
            <p><strong>11.3 Indemnity:</strong> Users agree to indemnify FoodAdda.in against any claims, damages, or liabilities arising from their usage of the Platform.</p>

            <p>For any queries, please contact us at <strong>consult.ajaysant@gmail.com</strong> or call <strong>9328137674</strong></p>
            <p><em>By using FoodAdda.in, you agree to these Terms and Conditions. Happy sourcing!</em></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
