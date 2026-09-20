const wordLabels: Readonly<Record<string, string>> = {
  Api: "API",
  Otp: "OTP",
  Faq: "FAQ",
  Cta: "Call to Action",
  Kbd: "Keyboard Key",
  Signup: "Sign Up",
};

/** A catalogue label for people; never use it as an import, slug or saved identifier. */
export function getCatalogueDisplayName(name: string): string {
  return name
    .replace(/Block$/, "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .split(/\s+/)
    .map((word) => wordLabels[word] ?? word)
    .join(" ")
    .trim();
}
