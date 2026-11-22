import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30 py-4 px-6" role="contentinfo">
      <div className="container max-w-4xl flex flex-col items-center gap-4 text-sm text-muted-foreground">
        {/* Copyright above the links at every width: side by side, the six links wrapped at 1280 px
            and squeezed the copyright into a narrow column (22 Nov 2026 review). */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="text-center">
            <p>© {currentYear} HeyGetOnMyLevel. {t("footer.rights")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("footer.personal")} {t("footer.license")}.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer navigation">
            <Link
              to="/about"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.about")}
            </Link>
            <Link
              to="/curriculum"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.curriculum")}
            </Link>
            <Link
              to="/install"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.install")}
            </Link>
            <a
              href="/HeyGetOnMyLevel_Curriculum_Map.docx"
              download
              className="hover:text-foreground transition-colors"
            >
              {t("footer.downloadCurriculum")}
            </a>
            <Link 
              to="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link 
              to="/terms" 
              className="hover:text-foreground transition-colors"
            >
              {t("footer.terms")}
            </Link>
          </nav>
        </div>

        {/* Our Family of Tools */}
        <div className="border-t border-border/50 pt-3 w-full text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Our Family of Tools</p>
          <div className="flex items-center justify-center gap-2 text-xs">
            <a
              href="https://time-2-read.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-foreground transition-colors"
            >
              Time2Read
            </a>
            <span className="text-border" aria-hidden="true">·</span>
            <span className="font-semibold text-foreground/80">HeyGetOnMyLevel</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Test reading levels with our companion tool.
          </p>
          <p className="text-xs mt-2">
            <a
              href="https://time-2-read.com"
              target="_blank"
              rel="noopener"
              className="font-semibold text-primary underline underline-offset-2 hover:opacity-80"
            >
              Included free with Time2Read Premium
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
