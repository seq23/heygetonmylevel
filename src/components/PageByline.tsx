import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Who wrote this page, and when it was last read through.
 *
 * WHY: the Search Readiness quality sample (item c6) reads the words on five live pages a week and
 * failed every content page here — "no named author or reviewer is visible". The publisher IS the
 * author: entity.json publishes no Person node on purpose ("the app speaks as a product, not a
 * person"), so the visible byline names HeyGetOnMyLevel and its parent, the same claim index.html's
 * Organization node makes. SEO.tsx states the same author in the page's JSON-LD.
 *
 * The date is a CONTENT date passed in by the page, never `new Date()`: a byline that moves on every
 * build is the same lie as a sitemap lastmod that does (item a6).
 */
const PageByline = ({ reviewed }: { reviewed?: string }) => {
  const { language } = useLanguage();
  const isEs = language === "es";
  // No date rather than an invented one: a page whose content date nobody has checked says only
  // who maintains it. (spry brain: never fake freshness.)
  const when = reviewed
    ? new Date(`${reviewed}T00:00:00Z`).toLocaleDateString(isEs ? "es-ES" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <p className="text-xs text-muted-foreground">
      {isEs ? "Escrito y mantenido por " : "Written and maintained by "}
      <span className="font-medium text-foreground">HeyGetOnMyLevel</span>
      {isEs ? ", un producto de " : ", a "}
      <a
        href="https://billionairehighperformancecoach.com/spry-labs"
        className="underline underline-offset-2 hover:text-foreground"
        rel="author"
      >
        Spry Labs
      </a>
      {isEs ? "." : " product."}
      {when && (
        <>
          {" "}
          <span className="whitespace-nowrap">
            {isEs ? "Revisado el " : "Reviewed "}
            <time dateTime={reviewed}>{when}</time>
          </span>
        </>
      )}
    </p>
  );
};

export default PageByline;
