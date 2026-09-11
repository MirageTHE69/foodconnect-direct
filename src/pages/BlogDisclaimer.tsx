import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const BlogDisclaimer = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Legal Disclaimer for Blogs</h1>
          <p className="text-muted-foreground mb-8">Applies to the FoodAdda blogs section</p>

          <div className="prose prose-sm sm:prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <h2>1. General Information</h2>
            <p>The information provided on the FoodAdda blogs section (this "Blog") is for general informational and educational purposes only. All content, including recipes, nutrition advice, and health-related information, is based on personal experience, research, and opinions. It should not be considered professional medical, legal, or nutritional advice.</p>

            <h2>2. No Professional Advice</h2>
            <p>The Blog does not provide medical, health, or dietary advice. The content is not a substitute for professional consultation with a doctor, nutritionist, or dietitian. Always consult a qualified professional before making dietary changes, especially if you have any medical conditions, allergies, or dietary restrictions.</p>

            <h2>3. Food Safety &amp; Allergies</h2>
            <p>While we strive to provide accurate ingredient lists and preparation methods, we cannot guarantee that the recipes are free from allergens such as nuts, dairy, gluten, or other ingredients that may cause allergic reactions. Please use your discretion and consult ingredient labels before consumption.</p>

            <h2>4. Accuracy of Information</h2>
            <p>We make every effort to ensure the information on the Blog is accurate and up to date. However, we do not guarantee its completeness, reliability, or accuracy. Ingredient availability, nutrition facts, and cooking methods may vary. We are not responsible for errors or omissions.</p>

            <h2>5. External Links &amp; Third-Party Content</h2>
            <p>The Blog may contain links to external websites for additional resources or affiliate products. We do not endorse or take responsibility for the content, policies, or services of third-party sites. Any reliance on external content is at your own risk.</p>

            <h2>6. Limitation of Liability</h2>
            <p>FoodAdda.in blogs section and its authors are not liable for any direct, indirect, incidental, or consequential damages that may result from using the information or recipes on this Blog. This includes, but is not limited to, foodborne illnesses, allergic reactions, or any adverse effects from following our content.</p>

            <h2>7. Copyright &amp; Intellectual Property</h2>
            <p>All text, images, and content on this Blog are the property of foodadda.in unless otherwise stated. Unauthorized use, reproduction, or distribution of our content without prior written permission is prohibited.</p>

            <h2>8. Changes to Disclaimer</h2>
            <p>We reserve the right to modify or update this disclaimer at any time without prior notice. By continuing to use the Blog, you acknowledge and accept any changes made.</p>

            <h2>9. Contact Information</h2>
            <p>For any questions regarding this disclaimer, please contact us at info@foodadda.in.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDisclaimer;
