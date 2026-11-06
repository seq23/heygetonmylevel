import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * Search Readiness a9: an unknown path should answer 404, not the homepage with 200.
 * The prerender (vite.config.ts) also writes this page to dist/404.html, which a static
 * host serves with status 404 for an unmatched path. A host that only does SPA fallback
 * ignores that file, and then robots noindex is what keeps the soft-404 out of the index.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Helmet>
        <title>Page not found — HeyGetOnMyLevel</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
