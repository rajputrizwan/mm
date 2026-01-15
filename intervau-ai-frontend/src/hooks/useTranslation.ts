import { useApp } from "../contexts/AppContext";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import pt from "../locales/pt.json";

type TranslationKey = string;

const translations = {
  en,
  es,
  fr,
  de,
  pt,
};

export function useTranslation() {
  const { language } = useApp();

  const t = (key: TranslationKey, defaultValue?: string): string => {
    const keys = key.split(".");
    let value: any = translations[language as keyof typeof translations];

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === "string" ? value : defaultValue || key;
  };

  return { t, language };
}
