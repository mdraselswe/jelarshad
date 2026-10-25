"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NameChipsInput } from "@/components/ui/name-chips-input";
import { isLatinText } from "@/lib/text/to-bangla";
import { useAdminT } from "@/i18n/admin-client";
import { toast } from "@/lib/toast";

import { adminAct } from "../actions";

export type PlaceEditValues = {
  placeId: string;
  nameBn: string;
  nameEn: string;
  /** Extra names people search the place by. */
  searchNames: string[];
  type: string;
  address: string;
  phone: string;
  website: string;
  hoursText: string;
  areaName: string;
  /** The chain's slug, or "" for none. */
  brandSlug: string;
};

const NEW_BRAND = "__new";
const TYPES = ["restaurant", "shop", "street_food", "bakery", "home_kitchen", "other"] as const;
const SELECT = "h-11 w-full rounded-card border border-border bg-card px-3 text-body";

/** Edit one place directly: name, kind, address, contact, hours, neighbourhood and chain. */
export function PlaceEditForm({
  initial,
  brands,
}: {
  initial: PlaceEditValues;
  brands: { slug: string; nameBn: string }[];
}) {
  const t = useAdminT();
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [newBrand, setNewBrand] = useState("");
  const [pending, startTransition] = useTransition();
  const set = (key: Exclude<keyof PlaceEditValues, "searchNames">) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const brand =
      values.brandSlug === ""
        ? null
        : values.brandSlug === NEW_BRAND
          ? { nameBn: newBrand }
          : { slug: values.brandSlug };
    startTransition(async () => {
      const result = await adminAct({
        kind: "place-update",
        placeId: values.placeId,
        nameBn: values.nameBn,
        ...(values.nameEn !== initial.nameEn ? { nameEn: values.nameEn } : {}),
        searchNames: values.searchNames,
        type: values.type,
        address: values.address,
        phone: values.phone,
        website: values.website,
        hoursText: values.hoursText,
        areaName: values.areaName,
        brand,
      });
      if (result.ok) {
        toast.success(t("admin.done"));
        router.refresh();
      } else toast.error(t(`errors.${result.error.code}`));
    });
  }

  const field = (
    key: Exclude<keyof PlaceEditValues, "searchNames">,
    label: string,
    type?: string,
  ) => (
    <label className="flex flex-col gap-1 text-meta font-semibold">
      {label}
      <Input
        type={type}
        value={values[key]}
        onChange={(event) => set(key)(event.target.value)}
        className="font-normal"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {field("nameBn", t("admin.editName"))}
      {field("nameEn", t(isLatinText(values.nameBn) ? "admin.editNameBangla" : "admin.editNameEn"))}
      <NameChipsInput
        value={values.searchNames}
        onChange={(searchNames) => setValues((current) => ({ ...current, searchNames }))}
        max={5}
        label={t("admin.searchNames")}
        hint={t("admin.searchNamesHint")}
        addLabel={t("admin.searchNameAdd")}
        removeLabel={(name) => t("admin.searchNameRemove", { name })}
      />
      <label className="flex flex-col gap-1 text-meta font-semibold">
        {t("admin.editType")}
        <select
          className={SELECT}
          value={values.type}
          onChange={(event) => set("type")(event.target.value)}
        >
          {TYPES.map((id) => (
            <option key={id} value={id}>
              {t(`admin.placeTypes.${id}`)}
            </option>
          ))}
        </select>
      </label>
      {field("areaName", t("admin.editArea"))}
      {field("address", t("admin.editAddress"))}
      {field("phone", t("admin.editPhone"), "tel")}
      {field("website", t("admin.editWebsite"))}
      {field("hoursText", t("admin.editHours"))}
      <label className="flex flex-col gap-1 text-meta font-semibold">
        {t("admin.editBrand")}
        <select
          className={SELECT}
          value={values.brandSlug}
          onChange={(event) => set("brandSlug")(event.target.value)}
        >
          <option value="">{t("admin.brandNone")}</option>
          {brands.map((brand) => (
            <option key={brand.slug} value={brand.slug}>
              {brand.nameBn}
            </option>
          ))}
          <option value={NEW_BRAND}>{t("admin.brandNew")}</option>
        </select>
      </label>
      {values.brandSlug === NEW_BRAND ? (
        <Input
          value={newBrand}
          onChange={(event) => setNewBrand(event.target.value)}
          placeholder={t("admin.brandNewName")}
          aria-label={t("admin.brandNewName")}
        />
      ) : null}
      <Button type="submit" disabled={pending || values.nameBn.trim() === ""}>
        {t("admin.save")}
      </Button>
    </form>
  );
}

/** Rename the neighbourhood this place is in (it changes for every place in it). */
export function AreaRenameForm({ areaId, current }: { areaId: number; current: string }) {
  const t = useAdminT();
  const router = useRouter();
  const [name, setName] = useState(current);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm(t("admin.areaRenameConfirm"))) return;
    startTransition(async () => {
      const result = await adminAct({ kind: "area-rename", areaId, nameBn: name });
      if (result.ok) {
        toast.success(t("admin.done"));
        router.refresh();
      } else toast.error(t(`errors.${result.error.code}`));
    });
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-label={t("admin.areaRename")}
        className="h-10"
      />
      <Button
        type="submit"
        size="sm"
        variant="soft"
        disabled={pending || name.trim() === "" || name.trim() === current}
      >
        {t("admin.save")}
      </Button>
    </form>
  );
}
