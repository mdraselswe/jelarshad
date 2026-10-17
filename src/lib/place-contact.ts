// Cleaning for a place's phone number, web address and opening hours (typed by people, so never
// trusted). Each returns the cleaned value, or null when it is empty or not usable.

/** A Bangladeshi or international phone number: digits with an optional +, spaces and dashes. */
export function cleanPhone(input: string | null | undefined): string | null {
  const text = (input ?? "").trim();
  if (text === "") return null;
  if (!/^\+?[0-9০-৯][0-9০-৯\s-]{5,18}$/.test(text)) return null;
  // Bangla digits to Latin, so tel: links and search work.
  const latin = text.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6));
  return latin.replace(/\s+/g, " ");
}

/** The digits (and a leading +) of a cleaned number, for a tel: link. */
export const phoneHref = (phone: string) => `tel:${phone.replace(/[^+0-9]/g, "")}`;

/** An http(s) address; a bare domain or facebook.com/page gets https:// added. */
export function cleanWebsite(input: string | null | undefined): string | null {
  const text = (input ?? "").trim();
  if (text === "" || /\s/.test(text) || text.length > 200) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Free text such as "শনি–বৃহস্পতি ১০:০০–২২:০০", one line, at most 120 characters. */
export function cleanHours(input: string | null | undefined): string | null {
  const text = (input ?? "").replace(/\s+/g, " ").trim();
  if (text === "") return null;
  return [...text].slice(0, 120).join("");
}
