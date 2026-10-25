"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useAdminT } from "@/i18n/admin-client";

import { adminAct, adminFindPlaces, type MergeCandidate } from "../actions";

/**
 * Merge this duplicate place into the right one. Likely matches (found by its name) are listed
 * first; anything else can be found by typing. Each row opens the other place to compare first.
 */
export function MergeForm({
  fromId,
  fromSlug,
  fromName,
  candidates,
}: {
  fromId: string;
  fromSlug: string;
  fromName: string;
  candidates: MergeCandidate[];
}) {
  const t = useAdminT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<MergeCandidate[] | null>(null);
  const [pending, startTransition] = useTransition();

  function find(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    startTransition(async () => {
      const result = await adminFindPlaces({ q: query.trim() });
      if (result.ok) setFound(result.data.filter((hit) => hit.slug !== fromSlug));
      else toast.error(t(`errors.${result.error.code}`));
    });
  }

  function merge(into: MergeCandidate) {
    if (!window.confirm(t("admin.mergeConfirmNamed", { from: fromName, into: into.nameBn })))
      return;
    startTransition(async () => {
      const result = await adminAct({ kind: "merge", fromId, intoSlug: into.slug });
      if (result.ok) {
        toast.success(t("admin.done"));
        router.refresh();
      } else toast.error(t(`errors.${result.error.code}`));
    });
  }

  const rows = (list: MergeCandidate[]) => (
    <ul className="mt-1.5 divide-y divide-divider overflow-hidden rounded-card border border-border">
      {list.map((hit) => (
        <li key={hit.slug} className="flex items-center gap-3 px-3 py-2">
          <a
            href={routes.place(hit.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1"
          >
            <span className="block truncate text-body font-semibold text-primary-text">
              {hit.nameBn}
            </span>
            <span className="block truncate text-meta text-muted-foreground">
              {hit.areaNameBn ? `${hit.areaNameBn}, ` : ""}
              {hit.districtNameBn}
            </span>
          </a>
          <Button
            type="button"
            size="sm"
            variant="soft"
            disabled={pending}
            onClick={() => merge(hit)}
          >
            {t("admin.mergeHere")}
          </Button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mt-3 rounded-card bg-muted/40 p-3">
      <p className="text-body font-semibold">{t("admin.mergeTitle")}</p>
      <details className="mt-1 text-meta text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-primary-text">
          {t("admin.mergeHow")}
        </summary>
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          <li>{t("admin.mergeWhen")}</li>
          <li>{t("admin.mergeEffect")}</li>
          <li>{t("admin.mergeSkip")}</li>
        </ul>
      </details>
      {candidates.length > 0 ? (
        <>
          <p className="mt-3 text-caption font-semibold text-muted-foreground">
            {t("admin.mergeLikely")}
          </p>
          {rows(candidates)}
        </>
      ) : (
        <p className="mt-3 text-meta text-muted-foreground">{t("admin.mergeNoLikely")}</p>
      )}
      <form onSubmit={find} className="mt-3 flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.mergeSearch")}
          aria-label={t("admin.mergeSearch")}
          className="h-10"
        />
        <Button type="submit" size="sm" variant="soft" disabled={pending || !query.trim()}>
          {t("admin.mergeFind")}
        </Button>
      </form>
      {found === null ? null : found.length === 0 ? (
        <p className="mt-2 text-meta text-muted-foreground">{t("admin.mergeNothing")}</p>
      ) : (
        rows(found)
      )}
    </div>
  );
}

/** The English or Banglish name people may type to find this place ("Ideal"). */
export function EnglishNameForm({ placeId, current }: { placeId: string; current: string }) {
  const t = useAdminT();
  const router = useRouter();
  const [name, setName] = useState(current);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await adminAct({ kind: "place-update", placeId, nameEn: name });
      if (result.ok) {
        toast.success(t("admin.done"));
        router.refresh();
      } else toast.error(t(`errors.${result.error.code}`));
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-1">
      <label htmlFor={`name-en-${placeId}`} className="text-meta font-semibold">
        {t("admin.editNameEn")}
      </label>
      <div className="flex gap-2">
        <Input
          id={`name-en-${placeId}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("admin.editNameEnPlaceholder")}
          className="h-10"
        />
        <Button type="submit" size="sm" variant="soft" disabled={pending || name === current}>
          {t("admin.save")}
        </Button>
      </div>
      <p className="text-caption text-muted-foreground">{t("admin.editNameEnHint")}</p>
    </form>
  );
}

/** Add or change a "famous for" entry: pick the district, type the food slug and a short note. */
export function FameForm({ districts }: { districts: { id: number; nameBn: string }[] }) {
  const t = useAdminT();
  const router = useRouter();
  const [districtId, setDistrictId] = useState(districts[0]?.id ?? 1);
  const [foodSlug, setFoodSlug] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await adminAct({
        kind: "fame-set",
        districtId,
        foodSlug: foodSlug.trim(),
        noteBn: note.trim() || null,
      });
      if (result.ok) {
        toast.success(t("admin.done"));
        setFoodSlug("");
        setNote("");
        router.refresh();
      } else toast.error(t(`errors.${result.error.code}`));
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <select
        value={districtId}
        onChange={(event) => setDistrictId(Number(event.target.value))}
        aria-label={t("admin.fameDistrict")}
        className="h-11 rounded-card border border-border bg-card px-3 text-body"
      >
        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.nameBn}
          </option>
        ))}
      </select>
      <Input
        value={foodSlug}
        onChange={(event) => setFoodSlug(event.target.value)}
        placeholder={t("admin.fameFood")}
        aria-label={t("admin.fameFood")}
      />
      <Input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={t("admin.fameNote")}
        aria-label={t("admin.fameNote")}
      />
      <Button type="submit" disabled={pending || !foodSlug.trim()}>
        {t("admin.save")}
      </Button>
    </form>
  );
}
