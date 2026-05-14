import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Privacy Policy — HeyGetOnMyLevel"
        description="HeyGetOnMyLevel collects no personal information. Sessions are ephemeral and zero-PII. Read our full privacy commitment."
        path="/privacy"
      />
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
          <h1 className="text-xl font-display font-bold">Privacy Policy</h1>
        </div>
      </header>

      <main id="main-content" className="container max-w-4xl py-8 px-6 flex-1">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-sm mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Our Commitment to Privacy</h2>
            <p className="text-muted-foreground">
              HeyGetOnMyLevel is designed with privacy at its core. We believe in providing a valuable 
              educational tool without requiring personal information. This policy explains what minimal 
              data we handle and how we protect your privacy.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">What We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect only what's necessary for the app to function:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Session ID:</strong> A random identifier that exists only while you use the app</li>
              <li><strong>Reading level selection:</strong> The grade level you choose to practice</li>
              <li><strong>Practice responses:</strong> Your answers during reading sessions (not graded or stored permanently)</li>
            </ul>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">What We Don't Collect</h2>
            <p className="text-muted-foreground mb-4">
              We intentionally do not collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Names, email addresses, or contact information</li>
              <li>Age, birthdate, or demographic information</li>
              <li>Location data or IP addresses for tracking</li>
              <li>Device identifiers or fingerprints</li>
              <li>Browsing history or behavior across other sites</li>
              <li>Any information that could identify you personally</li>
            </ul>
            <p className="text-muted-foreground mt-4 font-medium">
              We do not sell, share, or rent any information to third parties.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">How Long We Keep Data</h2>
            <p className="text-muted-foreground">
              Your session data is <strong>ephemeral</strong> — it exists only while you're actively using the app. 
              When you close your browser or navigate away, your session is automatically deleted. We don't maintain 
              any persistent records of your reading practice.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              We use the following services to provide our functionality:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>AI Content Generation:</strong> Reading passages and questions are generated using AI. 
                  No personal information is sent to these services — only requests for educational content.</li>
              <li><strong>Feedback Delivery:</strong> If you submit feedback, it's sent via email. 
                  We don't store feedback submissions in any database.</li>
            </ul>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Cookies</h2>
            <p className="text-muted-foreground">
              We use only one cookie: a <strong>sidebar preference cookie</strong> that remembers whether you've 
              collapsed the sidebar. This is a strictly functional cookie that doesn't track you or contain 
              personal information. No consent banner is required for this type of cookie under privacy regulations.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Children's Privacy</h2>
            <p className="text-muted-foreground">
              HeyGetOnMyLevel is open to users of all ages, including children. Because we don't collect any 
              personal information, there is no special data handling required for younger users. We encourage 
              parents and guardians to supervise their children's online activities and remind users of all ages 
              not to share personal information through feedback forms.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Your Rights</h2>
            <p className="text-muted-foreground">
              Since we don't collect personal information, traditional data rights (access, correction, deletion) 
              don't apply in the usual sense. However, you can always:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Leave the app at any time — your session data is automatically deleted</li>
              <li>Use the app without providing any personal information</li>
              <li>Contact us with any privacy questions or concerns</li>
            </ul>
            <p className="text-muted-foreground mt-4 text-sm">
              <strong>For all jurisdictions</strong> (EU/GDPR, California/CCPA, Virginia/VCDPA, Colorado/CPA, 
              Brazil/LGPD, Canada/PIPEDA, and others): Because we collect no personal data, your data rights 
              are satisfied by default. We do not sell, share, or rent any information.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              If we make significant changes to how we handle data, we'll update this policy and the "Last updated" 
              date above. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="card-elevated">
            <h2 className="text-lg font-semibold text-foreground mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or our practices, email us at{' '}
              <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">
                privacy@time-2-read.com
              </a>
              . Please do not include personal information in your message.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
