import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PageByline from "@/components/PageByline";

/**
 * The page that says who publishes this app. Search engines and AI answer tools
 * weight a named, consistent publisher; without one they have no entity to attribute
 * a citation to. Every claim here is one the site itself can be held to — what the
 * app does, what it costs, what it stores — and nothing more.
 */
const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="About HeyGetOnMyLevel — Who Makes This Reading App"
        description="HeyGetOnMyLevel is a free AI reading practice app published by Spry Labs. Who builds it, how the curriculum is organised, and what it does with your data."
        path="/about"
        breadcrumb={[{ name: "About", path: "/about" }]}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "@id": "https://heygetonmylevel.com/about#aboutpage",
            url: "https://heygetonmylevel.com/about",
            name: "About HeyGetOnMyLevel",
            mainEntity: { "@id": "https://heygetonmylevel.com/#organization" },
            publisher: { "@id": "https://heygetonmylevel.com/#organization" },
          },
        ]}
      />

      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-display font-bold">About HeyGetOnMyLevel</h1>
        </div>
      </header>

      <main id="main-content" className="container max-w-4xl py-8 px-6 flex-1">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="card-elevated mb-6">
            <p className="text-muted-foreground">
              <strong className="text-foreground">HeyGetOnMyLevel is a free reading practice app for all ages.</strong>{" "}
              It finds the level you read at now, generates passages at that level, checks vocabulary and
              comprehension, and lets you practise reading aloud. It runs in a browser, installs on a phone,
              tablet or desktop, and needs no account.
            </p>
            <PageByline />
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Who publishes it</h2>
            <p className="text-muted-foreground">
              HeyGetOnMyLevel is published by <strong className="text-foreground">Spry Labs</strong>, which
              also publishes{" "}
              <a
                href="https://time-2-read.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                Time2Read
              </a>
              , its companion reading-level tool. The two are published by the same company and share the same
              approach to reading practice. HeyGetOnMyLevel is included free with Time2Read Premium, and free
              to use on its own.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">How the curriculum is organised</h2>
            <p className="text-muted-foreground mb-4">
              Practice is mapped to a{" "}
              <Link to="/curriculum" className="text-primary underline underline-offset-2 hover:opacity-80">
                200-hour reading curriculum
              </Link>{" "}
              of five grade bands and twenty modules, each module ten hours:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Early Elementary</strong> — grades 1–2, phonics and decoding through to simple inference</li>
              <li><strong>Upper Elementary</strong> — grades 3–5, multi-syllable words and informational texts</li>
              <li><strong>Middle School</strong> — grades 6–8, roots, implicit themes and argument analysis</li>
              <li><strong>High School</strong> — grades 9–12, literary devices, rhetoric and synthesis</li>
              <li><strong>College and Adult</strong> — workplace, legal, medical and financial reading</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Each band works the same four skill areas — vocabulary and decoding, comprehension, inference
              and cause and effect, and reasoning — at the difficulty that band calls for.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Why it is judgment-free</h2>
            <p className="text-muted-foreground">
              Adults who read below the level they would like are often not short of ability but of a place to
              practise unobserved. HeyGetOnMyLevel keeps no account, no profile and no history: a session
              exists while you are in it and is gone afterwards. Nobody — including us — can look up what you
              read or how you did. What that means in detail is set out in the{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-2 hover:opacity-80">
                privacy policy
              </Link>
              .
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">What it costs</h2>
            <p className="text-muted-foreground">
              Nothing, for personal use. There is no advertising and no sign-up. Commercial and
              institutional use is covered by the{" "}
              <Link to="/terms" className="text-primary underline underline-offset-2 hover:opacity-80">
                terms of service
              </Link>{" "}
              and needs a licence.
            </p>
          </section>

          <section className="card-elevated mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">A note on what this is not</h2>
            <p className="text-muted-foreground">
              HeyGetOnMyLevel is reading practice, not assessment or diagnosis. It does not test for dyslexia
              or any other condition, it does not produce a score anyone else should rely on, and it is not a
              substitute for a teacher, a tutor or a specialist.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
