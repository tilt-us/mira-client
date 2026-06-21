import { FluentBundle, FluentResource } from "@fluent/bundle";
import deMessages from "./locales/de.ftl?raw";
import enMessages from "./locales/en.ftl?raw";

export type AppLocale = "de" | "en";

const messages: Record<AppLocale, string> = {
  de: deMessages,
  en: enMessages,
};

const bundles = new Map<AppLocale, FluentBundle>();

function getBundle(locale: AppLocale) {
  const existingBundle = bundles.get(locale);

  if (existingBundle) {
    return existingBundle;
  }

  const bundle = new FluentBundle(locale);
  bundle.addResource(new FluentResource(messages[locale]));
  bundles.set(locale, bundle);
  return bundle;
}

export function translate(locale: AppLocale, id: string) {
  const bundle = getBundle(locale);
  const message = bundle.getMessage(id);

  if (!message?.value) {
    return id;
  }

  return bundle.formatPattern(message.value);
}
