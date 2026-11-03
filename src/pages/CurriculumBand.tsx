import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Time2ReadCallout from "@/components/Time2ReadCallout";
import NotFound from "./NotFound";
import PageByline from "@/components/PageByline";
import { CURRICULUM_REVIEWED_ON, findBand, gradeBands } from "@/data/curriculum";
import { fitDescription } from "@/lib/seoText";

export const bandSeo = (slug: string) => {
  const gb = findBand(slug)!;
  const isAdult = gb.grades.length === 1 && gb.grades[0] === 13;
  const gradeLabel = isAdult ? "college and adult readers" : `grades ${gb.grades.join(", ")}`;
  // The search result line: the band and who it is for first, no brand suffix. With one
  // the longest of these would sit at exactly 65 characters, the very edge of the band.
  const range = `Grades ${gb.grades[0]}–${gb.grades[gb.grades.length - 1]}`;
  const title = isAdult ? "College and Adult Reading Curriculum" : `${gb.band} Reading Curriculum — ${range}`;
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
  const others = gradeBands.filter((o) => o.slug !== gb.slug);
  const moduleCount = gb.modules.length;
  const bandHours = gb.modules.reduce((h, m) => h + m.hours, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={seo.title}
        description={seo.description}
        path={`/curriculum/${gb.slug}`}
        reviewed={CURRICULUM_REVIEWED_ON}
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
          <p className="text-muted-foreground">
            {isEs
              ? `El currículo de ${gb.bandEs} son ${bandHours} horas en ${moduleCount} módulos para ${seo.gradeLabel}: ${gb.modules.map((m) => m.titleEs).join(", ")}. Cada sesión de HeyGetOnMyLevel genera un pasaje a tu nivel, revisa el vocabulario y la comprensión, y te deja practicar la lectura en voz alta. No hace falta cuenta y no se guarda nada personal.`
              : `The ${gb.band} curriculum is ${bandHours} hours in ${moduleCount} modules for ${seo.gradeLabel}: ${gb.modules.map((m) => m.title).join(", ")}. Every HeyGetOnMyLevel session generates a passage at your level, checks vocabulary and comprehension, and lets you practise reading aloud. No account is needed and nothing personal is stored.`}
          </p>
          <PageByline reviewed={CURRICULUM_REVIEWED_ON} />
        </section>

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
