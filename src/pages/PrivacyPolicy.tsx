import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">for FoodAdda.in</p>

          <div className="prose prose-sm sm:prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <p>Welcome to FoodAdda.in! This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our subscription-based platform for food-related sourcing, catering to B2B, B2C, and HoReCa, Franchise, food related jobs segments. By using FoodAdda.in, you consent to the practices described in this Privacy Policy.</p>

            <h2>1. Information We Collect</h2>
            <h3>1.1 Personal Information:</h3>
            <ul>
              <li>Name, email address, phone number</li>
              <li>Business name, GSTIN, FSSAI number (if applicable)</li>
              <li>Payment details (processed via third-party gateways)</li>
            </ul>
            <h3>1.2 Non-Personal Information:</h3>
            <ul>
              <li>IP address, device information, browser type</li>
              <li>Usage data such as pages visited, time spent, and interaction with features</li>
            </ul>
            <h3>1.3 Cookies &amp; Tracking Technologies:</h3>
            <p>We use cookies and similar technologies to enhance user experience and track platform usage.</p>

            <h2>2. How We Use Your Information</h2>
            <p>2.1 To provide and manage your account and subscription.</p>
            <p>2.2 To facilitate transactions between buyers and sellers.</p>
            <p>2.3 To improve platform functionality and personalize user experience.</p>
            <p>2.4 To send promotional communications, service updates, and important notifications.</p>
            <p>2.5 To comply with legal requirements and enforce our Terms &amp; Conditions.</p>

            <h2>3. Data Sharing &amp; Disclosure</h2>
            <p><strong>3.1 Third-Party Service Providers:</strong> We may share data with trusted service providers for payment processing, analytics, and marketing.</p>
            <p><strong>3.2 Legal Compliance:</strong> We may disclose information if required by law, court order, or government request.</p>
            <p><strong>3.3 Business Transfers:</strong> If FoodAdda.in undergoes a merger or acquisition, user data may be transferred to the new entity.</p>

            <h2>4. Data Security</h2>
            <p>4.1 We implement security measures such as encryption, secure servers, and access controls to protect user data.</p>
            <p>4.2 While we strive to safeguard data, no method of transmission over the internet is 100% secure.</p>

            <h2>5. User Rights</h2>
            <p><strong>5.1 Access &amp; Correction:</strong> Users can review and update their personal information via their account settings.</p>
            <p><strong>5.2 Opt-Out:</strong> Users may opt out of marketing communications by following the unsubscribe link.</p>
            <p><strong>5.3 Data Deletion:</strong> Users can request account deletion by contacting support.</p>

            <h2>6. Third-Party Links</h2>
            <p>FoodAdda.in may contain links to third-party websites. We are not responsible for their privacy practices.</p>

            <h2>7. Changes to This Policy</h2>
            <p>We reserve the right to update this Privacy Policy at any time. Users will be notified of significant changes.</p>

            <p>For any privacy-related queries, please contact us at <strong>consult.ajaysant@gmail.com</strong> or call <strong>9328137674</strong>.</p>
            <p><em>By using FoodAdda.in, you agree to this Privacy Policy. Thank you for trusting us!</em></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
