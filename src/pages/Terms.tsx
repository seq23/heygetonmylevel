import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-display font-bold">Terms of Service</h1>
        </div>
      </header>

      <main className="container max-w-4xl py-8 px-6 flex-1">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-sm mb-8">
            Last updated: January 2026
          </p>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using HeyGetOnMyLevel ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service. These terms apply to all users, 
              including those who are minors using the Service with appropriate supervision.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Service Description</h2>
            <p className="text-muted-foreground">
              HeyGetOnMyLevel is a free reading practice tool designed to help users improve their reading 
              comprehension skills. The Service provides reading passages and comprehension questions at 
              various grade levels. No account registration is required to use the Service.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">AI-Generated Content Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Important:</strong> Reading passages, questions, and educational content in this Service 
              are generated using artificial intelligence (AI). While we strive for accuracy and educational value:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI-generated content may occasionally contain errors or inaccuracies</li>
              <li>Facts presented in reading passages should be independently verified if used for academic purposes</li>
              <li>The Service is intended for reading practice, not as a primary source of factual information</li>
              <li>Content is generated dynamically and may vary between sessions</li>
            </ul>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">User Conduct</h2>
            <p className="text-muted-foreground mb-4">
              When using the Service, you agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Submit personal information (your own or others') through feedback forms</li>
              <li>Use automated systems or bots to access the Service</li>
              <li>Attempt to reverse engineer or extract source code from the Service</li>
            </ul>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service, including its design, functionality, and original content, is protected by copyright 
              and other intellectual property laws. AI-generated reading passages are created for educational use 
              within this Service. You may not reproduce, distribute, or create derivative works from the Service 
              without permission.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">No Warranty</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" and "as available" without warranties of any kind, either express 
              or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of 
              harmful components. We make no guarantees regarding educational outcomes or reading level improvements.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages arising from your use of the Service. This includes, 
              but is not limited to, damages for loss of data, educational setbacks, or any other intangible losses.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Parental Guidance</h2>
            <p className="text-muted-foreground">
              While the Service is designed to be appropriate for users of all ages, we encourage parents and 
              guardians to supervise their children's use of online services. The Service does not require or 
              collect personal information, but children should be reminded not to share personal details through 
              any feedback mechanisms.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Service Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue the Service at any time without notice. 
              We may also update these Terms of Service from time to time. Continued use of the Service after 
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard 
              to conflict of law principles. Any disputes arising from these Terms or the Service shall be 
              resolved in the appropriate courts of competent jurisdiction.
            </p>
          </section>

          <section className="card-elevated">
            <h2 className="text-lg font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please use the feedback button in the app to reach us. 
              Remember not to include personal information in your message.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
