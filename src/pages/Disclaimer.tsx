import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Disclaimer = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Disclaimer</h1>
          <p className="text-muted-foreground mb-8">Franchise &amp; Platform Disclaimer</p>

          <div className="prose prose-sm sm:prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <h2>1. Role of the Portal</h2>
            <p>Foodadda.in, owned and operated by Cirrus Trade Global ("the Company"), acts solely as an online intermediary platform facilitating communication and exchange of information between franchisors (entities offering franchises) and franchise seekers or franchisees (individuals or entities seeking franchise opportunities). The role of the portal is strictly limited to providing an online interface for listings and initial interactions. Foodadda.in does not participate in, negotiate, or influence any commercial or contractual terms between the parties.</p>

            <h2>2. No Legal Relationship or Liability</h2>
            <p>Foodadda.in and Cirrus Trade Global are not parties to any agreement, arrangement, or understanding entered into between franchisors and franchisees through or as a result of the platform. The Company shall have no legal responsibility, obligation, or liability whatsoever in relation to:</p>
            <ul>
              <li>the accuracy, reliability, or completeness of information provided by franchisors or franchisees;</li>
              <li>the authenticity, legality, or enforceability of any franchise offer or agreement;</li>
              <li>any commercial, financial, or other transaction conducted between users.</li>
            </ul>
            <p>All dealings between franchisors and franchisees are undertaken at their sole discretion, judgment, and risk.</p>

            <h2>3. Independent Verification</h2>
            <p>Users of Foodadda.in are solely responsible for conducting their own due diligence, verification, and professional consultation (legal, financial, or otherwise) prior to making any commitment, investment, or entering into any franchise arrangement.</p>
            <p>The Company does not verify or guarantee the financial viability, credibility, or authenticity of any business opportunity or claim made by the parties.</p>

            <h2>4. No Guarantee or Warranty</h2>
            <p>The platform and its services are provided on an "as is" and "as available" basis. Foodadda.in makes no express or implied warranties, representations, or guarantees regarding the quality, profitability, legality, or suitability of any franchise opportunity, business proposal, or information displayed on the website.</p>

            <h2>5. Indemnity</h2>
            <p>By accessing or using Foodadda.in, users agree to indemnify, defend, and hold harmless Cirrus Trade Global, its directors, employees, agents, and affiliates from and against any and all claims, losses, liabilities, damages, costs, or expenses (including reasonable legal fees) arising out of or in connection with:</p>
            <ul>
              <li>any communication, transaction, or contract between franchisors and franchisees;</li>
              <li>any misrepresentation, default, or breach of law by any user; or</li>
              <li>use or misuse of any information, listing, or service provided through the platform.</li>
            </ul>

            <h2>6. No Agency or Partnership</h2>
            <p>Nothing contained on Foodadda.in shall be deemed to create any agency, partnership, joint venture, employment, or fiduciary relationship between Cirrus Trade Global and any user, franchisor, or franchisee. All parties act in their individual and independent capacities.</p>

            <h2>7. Legal Compliance</h2>
            <p>This disclaimer is issued in accordance with the provisions of the Information Technology Act, 2000, and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.</p>
            <p>As an intermediary, Foodadda.in shall not be held liable for any third-party information, data, or content posted, transmitted, or made available on the platform, provided it observes due diligence as prescribed under applicable law.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimer;
