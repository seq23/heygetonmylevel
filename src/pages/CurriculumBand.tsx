import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Time2ReadCallout from "@/components/Time2ReadCallout";
import NotFound from "./NotFound";
import { findBand, gradeBands } from "@/data/curriculum";

export const bandSeo = (slug: string) => {
  const gb = findBand(slug)!;
  const gradeLabel = gb.grades.length === 1 && gb.grades[0] === 13 ? "college and adult readers" : `grades ${gb.grades.join(", ")}`;
  return {
    title: `${gb.band} Reading Curriculum (${gradeLabel}) — HeyGetOnMyLevel`,
    description: `Four 10-hour reading modules for ${gradeLabel}: ${gb.modules.map((m) => m.title).join(", ")}. Free, private, judgment-free practice.`,
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
  const others = gradeBands.filter((o) => o.slug !== gb.slug);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title={seo.title} description={seo.description} path={`/curriculum/${gb.slug}`} />
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
              {isEs ? "Grados" : "Grades"} {gb.grades.join(", ")} — 4 {isEs ? "módulos" : "modules"} • 40 {isEs ? "horas" : "hours"}
            </p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container max-w-4xl py-8 px-6 space-y-6 flex-1">
        <p className="text-muted-foreground">
          {isEs
            ? `Esta banda de grado cubre ${seo.gradeLabel} con cuatro módulos de 10 horas. Cada sesión de HeyGetOnMyLevel genera un pasaje a tu nivel, revisa el vocabulario y la comprensión, y te deja practicar la lectura en voz alta.`
            : `This grade band covers ${seo.gradeLabel} with four 10-hour modules. Every HeyGetOnMyLevel session generates a passage at your level, checks vocabulary and comprehension, and lets you practise reading aloud. No account is needed and nothing personal is stored.`}
        </p>

        {gb.modules.map((mod) => (
          <section key={mod.num} className="card-elevated">
            <h2 className="text-lg font-display font-bold flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">{mod.num}</span>
              {isEs ? mod.titleEs : mod.title}
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

        <div className="flex flex-wrap gap-3">
          <Link to="/assessment" className="btn-hero inline-flex items-center gap-2">
            {isEs ? "Evaluar mi nivel" : "Find my reading level"}
          </Link>
          <Link to="/select-level" className="btn-secondary-hero inline-flex items-center gap-2">
            {isEs ? "Elegir nivel y practicar" : "Pick a level and practise"}
          </Link>
        </div>

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

        <Time2ReadCallout />
      </main>
      <Footer />
    </div>
  );
};

export default CurriculumBand;
