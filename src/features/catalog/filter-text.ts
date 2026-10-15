import { toSearchKey } from "@/lib/text/normalize";

/**
 * What a list filter matches a row on: its words plus their phonetic key, so a name typed in Banglish
 * ("khilgaon") finds the Bangla row ("খিলগাঁও"), the same way search does.
 */
export function filterText(...parts: (string | null | undefined)[]): string {
  const text = parts.filter(Boolean).join(" ");
  return `${text} ${toSearchKey(text)}`;
}
