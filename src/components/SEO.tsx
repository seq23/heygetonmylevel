import { Helmet } from "react-helmet-async";

const SITE_URL = "https://heygetonmylevel.com";
const SITE_NAME = "HeyGetOnMyLevel";
const DEFAULT_OG = `${SITE_URL}/og-image.jpg`;
// entity.json's @id — the one node that says who this site is.
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
// The real pixel size of public/og-image.jpg. Declaring the true size is the point of
// these tags: a crawler that is told 1200x630 and handed a 1536x1024 file lays the card
// out wrong. The file is well above the 1200px width every network wants.
const OG_WIDTH = "1536";
const OG_HEIGHT = "1024";
const OG_ALT = "HeyGetOnMyLevel — AI-powered reading practice, shown beside an open book";

export interface Crumb {
  name: string;
  path: string;
}

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  /** Trail after Home. Derived from the path when not given. */
  breadcrumb?: Crumb[];
  /** Extra JSON-LD nodes for this page (the homepage's SoftwareApplication, for one). */
  schema?: Record<string, unknown>[];
  /**
   * The page's own content date (ISO, e.g. "2026-11-03"), the same date its visible byline shows.
   * Never a build date: a date that moves on every build teaches crawlers the dates are noise.
   */
  reviewed?: string;
}

/** "early-elementary" -> "Early Elementary". Used when a page gives no explicit trail. */
const labelFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const trailFor = (path: string, given?: Crumb[]): Crumb[] => {
  if (given) return given;
  const parts = path.split("/").filter(Boolean);
  return parts.map((slug, i) => ({ name: labelFromSlug(slug), path: `/${parts.slice(0, i + 1).join("/")}` }));
};

const SEO = ({ title, description, path, type = "website", image = DEFAULT_OG, breadcrumb, schema = [], reviewed }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const trail = trailFor(path, breadcrumb);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL },
    inLanguage: "en",
    primaryImageOfPage: { "@type": "ImageObject", url: image, width: OG_WIDTH, height: OG_HEIGHT },
    // The publisher IS the author: entity.json publishes no Person node on purpose ("the app speaks
    // as a product, not a person"), so every page names the organization that wrote it, the same
    // @id index.html's Organization node carries. PageByline shows the same claim to readers.
    author: { "@id": ORGANIZATION_ID, "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@id": ORGANIZATION_ID, "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(reviewed ? { dateModified: reviewed } : {}),
  };

  // Every page below the root gets a trail; the homepage is the root and has none.
  const breadcrumbList =
    trail.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "@id": `${url}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            ...trail.map((c, i) => ({
              "@type": "ListItem",
              position: i + 2,
              name: c.name,
              item: `${SITE_URL}${c.path}`,
            })),
          ],
        }
      : null;

  const nodes = [webPage, ...(breadcrumbList ? [breadcrumbList] : []), ...schema];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={OG_WIDTH} />
      <meta property="og:image:height" content={OG_HEIGHT} />
      <meta property="og:image:alt" content={OG_ALT} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {nodes.map((node, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(node)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
