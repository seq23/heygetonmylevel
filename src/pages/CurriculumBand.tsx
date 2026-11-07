import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { bandGuides } from "@/data/bandGuides";
import NotFound from "./NotFound";
import PageByline from "@/components/PageByline";
import { findBand, gradeBands } from "@/data/curriculum";
import { fitDescription } from "@/lib/seoText";

export const bandSeo = (slug: string) => {
  const gb = findBand(slug)!;
  const isAdult = gb.grades.length === 1 && gb.grades[0] === 13;
  const gradeLabel = isAdult ? "college and adult readers" : `grades ${gb.grades.join(", ")}`;
  // The search result line: the band and who it is for first, then the site's own name
  // (Search Readiness b10: a title that names no site lets a result be credited to a sibling).
  // The longest (Early/Upper Elementary) is 65 characters, inside check-seo-surfaces' 30-65 band.
  const range = `Grades ${gb.grades[0]}–${gb.grades[gb.grades.length - 1]}`;
  const title = `${isAdult ? "College and Adult Reading Curriculum" : `${gb.band} Reading Curriculum, ${range}`} — HeyGetOnMyLevel`;
  const who = isAdult ? "college and adult readers" : `grades ${gb.grades[0]}–${gb.grades[gb.grades.length - 1]}`;
  return {
    title,
    description: fitDescription(
      `Four 10-hour reading modules for ${who}: `,
      gb.modules.map((m) => m.title),
      "Free, private practice at your own level — no account needed.",
    ),
    gradeLabel,
  };
};

const CurriculumBand = () => {
  const { band } = useParams();
  const { language } = useLanguage();
  const isEs = language === "es";
  const gb = findBand(band);
  if (!gb) return <NotFound />;
  const seo = bandSeo(gb.slug);
  const guide = bandGuides[gb.slug];
  const others = gradeBands.filter((o) => o.slug !== gb.slug);
  const moduleCount = gb.modules.length;
  const bandHours = gb.modules.reduce((h, m) => h + m.hours, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={seo.title}
        description={seo.description}
        path={`/curriculum/${gb.slug}`}
        reviewed="2026-11-04"
        breadcrumb={[
          { name: "Curriculum", path: "/curriculum" },
          { name: gb.band, path: `/curriculum/${gb.slug}` },
        ]}
      />
      <header className="border-b border-border">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <Link to="/curriculum" className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Back to the curriculum map">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">
              {isEs ? gb.bandEs : gb.band}: {isEs ? "currículo de lectura" : "reading curriculum"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEs ? "Grados" : "Grades"} {gb.grades.join(", ")} — {moduleCount} {isEs ? "módulos" : "modules"} • {bandHours}{" "}
              {isEs ? "horas" : "hours"}
            </p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container max-w-4xl py-8 px-6 space-y-6 flex-1">
        {/* The band's own answer, under the question a reader actually asks. */}
        <section className="space-y-3">
          <h2 className="text-lg font-display font-bold">
            {isEs
              ? `¿Qué cubre el currículo de lectura de ${gb.bandEs}?`
              : `What does the ${gb.band} reading curriculum cover?`}
          </h2>
          <p className="text-muted-foreground">{guide.definition}</p>
          <PageByline reviewed="2026-11-04" />
        </section>

        <section className="card-elevated">
          <h2 className="text-lg font-display font-bold">What can you practise in this band?</h2>
          <p className="mt-2">{guide.task}</p>
          <ol className="list-decimal pl-6 mt-3 space-y-2">{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
        </section>

        {gb.modules.map((mod) => (
          <section key={mod.num} className="card-elevated">
            <h2 className="text-lg font-display font-bold flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">{mod.num}</span>
              {isEs ? `¿Qué se practica en ${mod.titleEs}?` : `What does ${mod.title} cover?`}
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-normal">
                <Clock className="w-3 h-3" /> {mod.hours}h
              </span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2">{isEs ? mod.descEs : mod.desc}</p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong className="text-foreground">{isEs ? "Habilidades:" : "Skills:"}</strong> {isEs ? mod.skillsEs : mod.skills}
            </p>
          </section>
        ))}

        <section className="card-elevated">
          <h2 className="text-lg font-display font-bold">{guide.question}</h2>
          <p className="mt-2">{guide.answer}</p>
          <h2 className="text-lg font-display font-bold mt-4">What is this curriculum based on?</h2>
          <p className="mt-2">Module names, skills and planned hours describe HeyGetOnMyLevel’s own curriculum design. Hours are a practice plan, not a measured time to reach proficiency. For background on explicit comprehension strategies, see <a className="underline" href="https://www.readingrockets.org/topics/comprehension/articles/seven-strategies-teach-students-text-comprehension">Reading Rockets’ teaching guide</a>. Practice examples here are suggestions, not standardized assessments.</p>
        </section>
        <aside aria-label="Next step" className="card-elevated">
        <h2 className="text-lg font-display font-bold mb-3">How can you start practising?</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/assessment" className="btn-hero inline-flex items-center gap-2">
            {isEs ? "Evaluar mi nivel" : "Find my reading level"}
          </Link>
          <Link to="/select-level" className="btn-secondary-hero inline-flex items-center gap-2">
            {isEs ? "Elegir nivel y practicar" : "Pick a level and practise"}
          </Link>
        </div>

        </aside>

        <nav aria-label="Other grade bands" className="pt-2">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> {isEs ? "Otras bandas de grado" : "Other grade bands"}
          </h2>
          <ul className="flex flex-wrap gap-3 text-sm">
            {others.map((o) => (
              <li key={o.slug}>
                <Link to={`/curriculum/${o.slug}`} className="text-primary underline underline-offset-2">
                  {isEs ? o.bandEs : o.band}
                </Link>
              </li>
            ))}
          </ul>
        </nav>


      </main>
      <Footer />
    </div>
  );
};

export default CurriculumBand;
