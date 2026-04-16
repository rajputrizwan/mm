import { useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import pt from "../locales/pt.json";

type TranslationKey = string;
type InterpolationValues = Record<string, string | number>;

const translations = {
  en,
  es,
  fr,
  de,
  pt,
};

export function useTranslation() {
  const { language } = useApp();

  const t = useCallback(
    (key: TranslationKey, valuesOrDefault?: InterpolationValues | string): string => {
      const keys = key.split(".");
      let value: any = translations[language as keyof typeof translations];

      for (const k of keys) {
        if (value && typeof value === "object") {
          value = value[k];
        } else {
          // Return default value if it's a string, otherwise return the key
          return typeof valuesOrDefault === "string" ? valuesOrDefault : key;
        }
      }

      if (typeof value !== "string") {
        return typeof valuesOrDefault === "string" ? valuesOrDefault : key;
      }

      // If valuesOrDefault is an object, perform interpolation
      if (typeof valuesOrDefault === "object" && valuesOrDefault !== null) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, placeholder) => {
          return String(valuesOrDefault[placeholder] ?? `{{${placeholder}}}`);
        });
      }

      return value;
    },
    [language],
  );

  return { t, language };
}
