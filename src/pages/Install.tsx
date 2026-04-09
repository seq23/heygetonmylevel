import { ArrowLeft, Smartphone, Tablet, Monitor, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";

const Install = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const steps = {
    android: [
      { en: "Open Chrome and go to heygetonmylevel.lovable.app", es: "Abre Chrome y ve a heygetonmylevel.lovable.app" },
      { en: "Tap the three-dot menu (⋮) in the top-right corner", es: "Toca el menú de tres puntos (⋮) en la esquina superior derecha" },
      { en: 'Select "Add to Home screen" or "Install app"', es: 'Selecciona "Añadir a pantalla de inicio" o "Instalar app"' },
      { en: "Tap Add / Install to confirm", es: "Toca Añadir / Instalar para confirmar" },
      { en: "The app icon will appear on your home screen", es: "El ícono de la app aparecerá en tu pantalla de inicio" },
    ],
    ipad: [
      { en: "Open Safari and go to heygetonmylevel.lovable.app", es: "Abre Safari y ve a heygetonmylevel.lovable.app" },
      { en: "Tap the Share button (square with arrow) at the top", es: "Toca el botón Compartir (cuadro con flecha) en la parte superior" },
      { en: 'Scroll down and tap "Add to Home Screen"', es: 'Desplázate hacia abajo y toca "Añadir a pantalla de inicio"' },
      { en: "Tap Add in the top-right corner", es: "Toca Añadir en la esquina superior derecha" },
      { en: "The app will open in full-screen mode like a native app", es: "La app se abrirá en modo pantalla completa como una app nativa" },
    ],
    desktop: [
      { en: "Open Chrome, Edge, or Brave and go to heygetonmylevel.lovable.app", es: "Abre Chrome, Edge o Brave y ve a heygetonmylevel.lovable.app" },
      { en: "Look for the install icon (⊕) in the address bar", es: "Busca el ícono de instalación (⊕) en la barra de direcciones" },
      { en: 'Click "Install" when prompted', es: 'Haz clic en "Instalar" cuando se te solicite' },
      { en: "The app will open in its own window", es: "La app se abrirá en su propia ventana" },
    ],
    score7c: [
      { en: "Open the built-in browser on the SCORE 7c tablet", es: "Abre el navegador integrado en la tableta SCORE 7c" },
      { en: "Navigate to heygetonmylevel.lovable.app", es: "Navega a heygetonmylevel.lovable.app" },
      { en: "Tap the browser menu and select Add to Home Screen", es: "Toca el menú del navegador y selecciona Añadir a pantalla de inicio" },
      { en: "Confirm installation — the app will be available offline for previously visited content", es: "Confirma la instalación — la app estará disponible sin conexión para contenido previamente visitado" },
      { en: "For institutional deployment, a commercial license is required — contact privacy@time-2-read.com", es: "Para despliegue institucional, se requiere una licencia comercial — contacta privacy@time-2-read.com" },
    ],
  };

  const { language } = useLanguage();

  const renderSteps = (deviceSteps: { en: string; es: string }[]) => (
    <ol className="space-y-3 list-none" role="list">
      {deviceSteps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <span className="text-foreground pt-0.5">{step[language]}</span>
        </li>
      ))}
    </ol>
  );

  const sections = [
    {
      icon: Tablet,
      titleEn: "Android Tablet / Phone",
      titleEs: "Tableta / Teléfono Android",
      key: "android" as const,
    },
    {
      icon: Tablet,
      titleEn: "iPad / iPhone (Safari)",
      titleEs: "iPad / iPhone (Safari)",
      key: "ipad" as const,
    },
    {
      icon: Monitor,
      titleEn: "Desktop (Chrome / Edge / Brave)",
      titleEs: "Escritorio (Chrome / Edge / Brave)",
      key: "desktop" as const,
    },
    {
      icon: Smartphone,
      titleEn: "SCORE 7c Tablet (Correctional Facilities)",
      titleEs: "Tableta SCORE 7c (Instalaciones Correccionales)",
      key: "score7c" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="container max-w-3xl flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={language === "es" ? "Volver" : "Go back"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">
            <Download className="w-5 h-5 inline mr-2" aria-hidden="true" />
            {language === "es" ? "Instalar HeyGetOnMyLevel" : "Install HeyGetOnMyLevel"}
          </h1>
        </div>
      </header>

      <main id="main-content" className="flex-1 px-6 py-8">
        <div className="container max-w-3xl space-y-8">
          <section aria-labelledby="install-intro">
            <p id="install-intro" className="text-muted-foreground text-lg">
              {language === "es"
                ? "HeyGetOnMyLevel se puede instalar directamente desde tu navegador — no se necesita tienda de aplicaciones. El contenido visitado previamente estará disponible sin conexión."
                : "HeyGetOnMyLevel can be installed directly from your browser — no app store needed. Previously visited content will be available offline."}
            </p>
          </section>

          {sections.map((section) => (
            <section
              key={section.key}
              className="card-elevated space-y-4"
              aria-labelledby={`heading-${section.key}`}
            >
              <h2
                id={`heading-${section.key}`}
                className="text-lg font-display font-bold text-foreground flex items-center gap-2"
              >
                <section.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                {language === "es" ? section.titleEs : section.titleEn}
              </h2>
              {renderSteps(steps[section.key])}
            </section>
          ))}

          <section className="bg-muted/50 rounded-2xl p-6" aria-labelledby="offline-heading">
            <h2 id="offline-heading" className="text-lg font-display font-bold text-foreground mb-2">
              {language === "es" ? "¿Qué funciona sin conexión?" : "What works offline?"}
            </h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary" aria-hidden="true">✓</span>
                {language === "es" ? "Páginas y pasajes visitados anteriormente" : "Previously visited pages and passages"}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary" aria-hidden="true">✓</span>
                {language === "es" ? "Interfaz de la aplicación y navegación" : "App interface and navigation"}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive" aria-hidden="true">✗</span>
                {language === "es" ? "Generación de nuevos pasajes con IA (requiere internet)" : "Generating new AI passages (requires internet)"}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive" aria-hidden="true">✗</span>
                {language === "es" ? "Compañero de lectura con IA (requiere internet)" : "AI Reading Buddy (requires internet)"}
              </li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
