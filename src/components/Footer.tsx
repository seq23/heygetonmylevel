import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30 py-4 px-6">
      <div className="container max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>© {currentYear} HeyGetOnMyLevel. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          <Link 
            to="/privacy" 
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-border">•</span>
          <Link 
            to="/terms" 
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
