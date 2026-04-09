import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30 py-4 px-6" role="contentinfo">
      <div className="container max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="text-center sm:text-left">
          <p>© {currentYear} HeyGetOnMyLevel. {t("footer.rights")}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {t("footer.personal")}{" "}
            <a
              href="mailto:privacy@time-2-read.com?subject=Commercial%20Licensing%20Inquiry"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {t("footer.license")}
            </a>
            .
          </p>
        </div>
        <nav className="flex items-center gap-4 flex-wrap justify-center" aria-label="Footer navigation">
          <Link 
            to="/curriculum" 
            className="hover:text-foreground transition-colors"
          >
            {t("footer.curriculum")}
          </Link>
          <span className="text-border" aria-hidden="true">•</span>
          <Link
            to="/install"
            className="hover:text-foreground transition-colors"
          >
            📱 {t("footer.install")}
          </Link>
          <span className="text-border" aria-hidden="true">•</span>
          <a
            href="/HeyGetOnMyLevel_Curriculum_Map.docx"
            download
            className="hover:text-foreground transition-colors"
          >
            📄 {t("footer.downloadCurriculum")}
          </a>
          <span className="text-border" aria-hidden="true">•</span>
          <Link 
            to="/privacy" 
            className="hover:text-foreground transition-colors"
          >
            {t("footer.privacy")}
          </Link>
          <span className="text-border" aria-hidden="true">•</span>
          <Link 
            to="/terms" 
            className="hover:text-foreground transition-colors"
          >
            {t("footer.terms")}
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
