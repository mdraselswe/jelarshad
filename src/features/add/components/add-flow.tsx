"use client";

import { HeartIcon, MapPinIcon, UtensilsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "@/lib/toast";

import { IconChip } from "@/components/ui/icon-chip";
import { NameChipsInput } from "@/components/ui/name-chips-input";
import { routes } from "@/config/routes";
import type { PlaceType, Reaction } from "@/core/domain";
import { useT } from "@/i18n/client";
import { isLatinText, latinToBangla } from "@/lib/text/to-bangla";
import type { MessageKey } from "@/i18n/t";
import { cn } from "@/lib/cn";

import { appConfig } from "@/config/app.config";
import { attachPhotos } from "@/features/media/actions";
import { offerLeaderboard } from "@/features/game/offer-leaderboard";
import { showReward, stampText } from "@/features/reward/show-reward";
import { levelNameKey } from "@/features/game/components/game-bits";
import type { Reward } from "@/services/reward-service";
import { uploadPhotos } from "@/features/media/upload";
import { formatNumber } from "@/lib/format/number";
import { checkPickedFile } from "@/lib/image/compress";

import { findSimilarPlaces, submitAdd, suggestForAdd } from "../actions";

type Suggestion = { id: string; nameBn: string; meta: string | null };
type DistrictOption = { id: number; nameBn: string };
type FoodChoice = { id: string; nameBn: string } | { id: null; nameBn: string };
type PlaceChoice = { id: string; nameBn: string } | null;

const INPUT = "h-14 w-full rounded-input border border-border bg-card px-4 text-base";
const LABEL = "mb-1.5 block text-meta font-semibold";
const CARD = "rounded-[28px] border border-border bg-card p-5 shadow-card";
const PLACE_TYPE_IDS: PlaceType[] = [
  "restaurant",
  "shop",
  "street_food",
  "bakery",
  "home_kitchen",
  "other",
];
const REACTIONS: { id: Reaction; label: MessageKey; tone: string }[] = [
  {
    id: "loved",
    label: "reaction.lovedShort",
    tone: "border-success bg-success-soft text-success-fg",
  },
  {
    id: "okay",
    label: "reaction.okayShort",
    tone: "border-warning bg-warning-soft text-warning-fg",
  },
  {
    id: "disliked",
    label: "reaction.dislikedShort",
    tone: "border-danger bg-danger-soft text-danger-fg",
  },
];

/** Suggestions for what is being typed, fetched 250 ms after the last keystroke. */
function useSuggestions(kind: "food" | "place", q: string, districtId: number | null, on: boolean) {
  const [found, setFound] = useState<{ key: string; items: Suggestion[] }>({ key: "", items: [] });
  const key = `${kind}|${districtId ?? ""}|${q}`;
  const wanted = on && q.trim().length > 0;
  useEffect(() => {
    if (!wanted) return;
    let live = true;
    const timer = setTimeout(async () => {
      const result = await suggestForAdd({ kind, q, ...(districtId ? { districtId } : {}) });
      if (live && result.ok) setFound({ key, items: result.data });
    }, 250);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [kind, q, districtId, wanted, key]);
  // Results of an older query are never shown for a newer one.
  return wanted && found.key === key ? found.items : [];
}

/**
 * The add flow: food, place, reaction. Three steps on a phone, three sections on one screen from
 * 1024px. Similar places are checked before a new one is created (docs/01 §3.7).
 */
export function AddFlow({ districts }: { districts: DistrictOption[] }) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);

  const [foodQuery, setFoodQuery] = useState("");
  const [food, setFood] = useState<FoodChoice | null>(null);
  // "এটাই কি?": shown once before a typed name becomes a new food while close ones exist.
  const [askFood, setAskFood] = useState(false);
  // The Latin spelling a person turned into Bangla with the suggestion button (kept as English name).
  const [foodLatin, setFoodLatin] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  // The suggestions under the name field close when focus leaves it, on Escape, or when the person
  // chooses to add the typed name as a new place; typing opens them again.
  const [placeListOpen, setPlaceListOpen] = useState(true);
  const [place, setPlace] = useState<PlaceChoice>(null);
  const [placeType, setPlaceType] = useState<PlaceType>("restaurant");
  // The new place's name in the other script, and extra names people search it by.
  const [otherName, setOtherName] = useState("");
  const [searchNames, setSearchNames] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [hours, setHours] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [similar, setSimilar] = useState<Suggestion[] | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState<{ placeSlug: string; reward: Reward } | null>(null);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);

  const foodSuggestions = useSuggestions("food", foodQuery, null, food === null);
  const placeSuggestions = useSuggestions(
    "place",
    placeQuery,
    districtId,
    place === null && districtId !== null,
  );

  const needFood = foodQuery.trim() === "" && food === null;
  // A new place typed in English asks for its Bangla name, and the other way round.
  const placeLatin = isLatinText(placeQuery);
  const needPlace = districtId === null || (place === null && placeQuery.trim() === "");

  function chooseFood(next: FoodChoice) {
    setFood(next);
    setFoodQuery(next.nameBn);
  }

  function pickPhotos(files: FileList | null) {
    if (!files) return;
    const room = appConfig.media.maxPhotosPerExperience - photos.length;
    const next: { file: File; preview: string }[] = [];
    for (const file of Array.from(files).slice(0, Math.max(room, 0))) {
      const problem = checkPickedFile(file);
      if (problem) toast.error(t(problem === "too_big" ? "photos.tooBig" : "photos.notImage"));
      else next.push({ file, preview: URL.createObjectURL(file) });
    }
    setPhotos((current) => [...current, ...next]);
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return current.filter((_, position) => position !== index);
    });
  }

  function goTo(next: number) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  async function checkSimilarThenContinue() {
    if (needPlace) return toast.error(t("add.needPlace"));
    if (place === null && districtId !== null && !confirmNew) {
      const result = await findSimilarPlaces({ nameBn: placeQuery, districtId });
      if (result.ok && result.data.length > 0) {
        setSimilar(result.data);
        return;
      }
    }
    setSimilar(null);
    goTo(3);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return toast.error(t("add.locationFailed"));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        toast.success(t("add.locationSet"));
      },
      () => toast.error(t("add.locationFailed")),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  function submit() {
    if (reaction === null) return toast.error(t("add.needReaction"));
    if (needFood) return toast.error(t("add.needFood"));
    if (needPlace) return toast.error(t("add.needPlace"));
    const trimmedPrice = price.replace(/[^\d]/g, "");
    startTransition(async () => {
      const result = await submitAdd({
        food:
          food && food.id
            ? { id: food.id }
            : { nameBn: foodQuery, ...(foodLatin ? { nameEn: foodLatin } : {}) },
        place:
          place !== null
            ? { id: place.id }
            : {
                nameBn: placeQuery,
                otherName: otherName || null,
                searchNames,
                districtId: districtId ?? 0,
                type: placeType,
                areaName: area || null,
                location,
                phone: phone || null,
                website: website || null,
                hoursText: hours || null,
              },
        reaction,
        comment: comment || null,
        pricePaid: trimmedPrice ? Number(trimmedPrice) : null,
        confirmNewPlace: confirmNew,
      });
      if (result.ok) {
        // The experience is saved; photos are best-effort so a slow upload never loses the entry.
        if (photos.length > 0) {
          const uploaded = await uploadPhotos(photos.map((photo) => photo.file));
          const attached =
            uploaded.keys.length > 0
              ? await attachPhotos({ experienceId: result.data.experienceId, keys: uploaded.keys })
              : null;
          if (uploaded.failed > 0 || (attached && !attached.ok)) toast.error(t("photos.failed"));
        }
        setDone({ placeSlug: result.data.placeSlug, reward: result.data.reward });
        // The success screen below is the celebration, so the toast stays a toast.
        showReward(t, result.data.reward, t("add.doneTitle"), { celebrate: false });
        offerLeaderboard(t);
        router.refresh();
        return;
      }
      if (result.error.code === "auth_required") {
        router.push(routes.login({ next: routes.add() }));
        return;
      }
      if (result.error.code === "conflict") {
        goTo(2);
        void checkSimilarThenContinue();
        return;
      }
      toast.error(t(`errors.${result.error.code}`));
    });
  }

  if (done) {
    return (
      <div role="status" className={cn(CARD, "text-center lg:mx-auto lg:max-w-xl")}>
        <h2 className="text-title-1">{t("add.doneTitle")}</h2>
        <p className="mt-2 text-body text-muted-foreground">{t("add.doneBody")}</p>
        {done.reward.points > 0 && (
          <p className="mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-grad-reward px-3 py-1 font-display text-lg font-bold text-on-reward">
              +
              {formatNumber(
                done.reward.points +
                  (done.reward.missions?.reduce((sum, mission) => sum + mission.bonus, 0) ?? 0),
              )}
            </span>
            <span className="text-card-title">
              {stampText(t, done.reward) ?? t("reward.points")}
            </span>
          </p>
        )}
        {done.reward.levelUp ? (
          <p className="mt-2 text-card-title text-primary-text">
            {t("game.levelUpBody", { name: t(levelNameKey(done.reward.levelUp.level)) })}
          </p>
        ) : null}
        <Link
          href={routes.place(done.placeSlug)}
          className="mt-5 flex h-14 press items-center justify-center rounded-button bg-primary bg-grad-action text-[17px] font-semibold text-primary-foreground"
        >
          {t("add.seePlace")}
        </Link>
        <button
          type="button"
          onClick={() => window.location.assign(routes.add())}
          className="mt-3 h-12 w-full press rounded-button border border-border text-base font-semibold"
        >
          {t("add.addMore")}
        </button>
      </div>
    );
  }

  const show = (n: number) => (step === n ? "" : "hidden lg:block");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 3 || window.matchMedia("(min-width: 1024px)").matches) submit();
      }}
    >
      <div className="lg:hidden">
        <p className="text-meta text-muted-foreground">{t("add.stepOf", { step: String(step) })}</p>
        <div aria-hidden className="mt-2 flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-grad-action" : "bg-muted")}
            />
          ))}
        </div>
      </div>

      <section className={cn(CARD, show(1))} aria-labelledby="add-food">
        <div className="flex items-center gap-2.5">
          <IconChip tone="coral">
            <UtensilsIcon />
          </IconChip>
          <h2 id="add-food" className="text-heading">
            {t("add.food")}
          </h2>
        </div>
        <div className="relative mt-3">
          <input
            className={INPUT}
            value={foodQuery}
            placeholder={t("add.foodHint")}
            aria-label={t("add.food")}
            onChange={(event) => {
              setFoodQuery(event.target.value);
              setFood(null);
              setAskFood(false);
              setFoodLatin(null);
            }}
          />
        </div>
        {food === null && isLatinText(foodQuery) && !askFood && latinToBangla(foodQuery) !== "" && (
          <button
            type="button"
            className="mt-2 h-11 w-full press rounded-full bg-primary-soft px-4 text-left font-semibold text-primary-soft-fg"
            onClick={() => {
              setFoodLatin(foodQuery.trim());
              setFoodQuery(latinToBangla(foodQuery));
            }}
          >
            {t("add.inBangla", { name: latinToBangla(foodQuery) })}
          </button>
        )}
        {food === null && foodQuery.trim() !== "" && askFood && (
          <div
            role="group"
            aria-labelledby="add-similar-food"
            className="mt-2 rounded-input border border-warning bg-warning-soft p-3.5"
          >
            <p id="add-similar-food" className="font-semibold">
              {t("add.similarFoodTitle")}
            </p>
            <p className="text-meta text-muted-foreground">{t("add.similarFoodHint")}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {foodSuggestions.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="h-11 w-full press rounded-full border border-border bg-card px-4 text-left font-semibold"
                    onClick={() => {
                      chooseFood({ id: item.id, nameBn: item.nameBn });
                      setAskFood(false);
                    }}
                  >
                    {item.nameBn}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-2 h-11 w-full press rounded-full px-4 text-left text-primary-text"
              onClick={() => {
                chooseFood({ id: null, nameBn: foodQuery.trim() });
                setAskFood(false);
              }}
            >
              {t("add.similarFoodNone", { name: foodQuery.trim() })}
            </button>
          </div>
        )}
        {food === null && foodQuery.trim() !== "" && !askFood && (
          <ul className="mt-2 divide-y divide-divider rounded-input border border-border">
            {foodSuggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="h-12 w-full px-4 text-left"
                  onClick={() => chooseFood({ id: item.id, nameBn: item.nameBn })}
                >
                  {item.nameBn}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="h-12 w-full px-4 text-left text-primary-text"
                onClick={() => {
                  // Close names exist: ask once before creating a second one.
                  if (foodSuggestions.length > 0) setAskFood(true);
                  else chooseFood({ id: null, nameBn: foodQuery.trim() });
                }}
              >
                {t("add.newFood", { name: foodQuery.trim() })}
              </button>
            </li>
          </ul>
        )}
        <button
          type="button"
          className="mt-4 h-12 w-full press rounded-button bg-primary bg-grad-action text-base font-semibold text-primary-foreground lg:hidden"
          onClick={() => (needFood ? toast.error(t("add.needFood")) : goTo(2))}
        >
          {t("add.next")}
        </button>
      </section>

      <section className={cn(CARD, show(2))} aria-labelledby="add-place">
        <div className="flex items-center gap-2.5">
          <IconChip tone="teal">
            <MapPinIcon />
          </IconChip>
          <h2 id="add-place" className="text-heading">
            {t("add.place")}
          </h2>
        </div>
        <label htmlFor="add-district" className={cn(LABEL, "mt-3")}>
          {t("add.district")}
        </label>
        <select
          id="add-district"
          className={INPUT}
          value={districtId ?? ""}
          onChange={(event) => {
            setDistrictId(event.target.value ? Number(event.target.value) : null);
            setPlace(null);
            setSimilar(null);
          }}
        >
          <option value="">{t("add.pickDistrict")}</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.nameBn}
            </option>
          ))}
        </select>

        <label htmlFor="add-place-name" className={cn(LABEL, "mt-3")}>
          {t("add.placeName")}
        </label>
        <div
          onBlur={(event) => {
            // Moving between the field and its list keeps it open; leaving both closes it.
            if (!event.currentTarget.contains(event.relatedTarget)) setPlaceListOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setPlaceListOpen(false);
          }}
        >
          <input
            id="add-place-name"
            className={INPUT}
            value={placeQuery}
            disabled={districtId === null}
            onFocus={() => setPlaceListOpen(true)}
            onChange={(event) => {
              setPlaceQuery(event.target.value);
              setPlace(null);
              setSimilar(null);
              setConfirmNew(false);
              setPlaceListOpen(true);
            }}
          />
          {place === null && placeQuery.trim() !== "" && placeListOpen && (
            <ul className="mt-2 divide-y divide-divider rounded-input border border-border">
              {placeSuggestions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left"
                    onClick={() => {
                      setPlace({ id: item.id, nameBn: item.nameBn });
                      setPlaceQuery(item.nameBn);
                    }}
                  >
                    <span className="block font-semibold">{item.nameBn}</span>
                    {item.meta && (
                      <span className="block text-caption text-muted-foreground">{item.meta}</span>
                    )}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="h-12 w-full px-4 text-left text-primary-text"
                  onClick={() => setPlaceListOpen(false)}
                >
                  {t("add.newPlace", { name: placeQuery.trim() })}
                </button>
              </li>
            </ul>
          )}
        </div>
        {place === null && placeQuery.trim() !== "" && (
          <>
            <p className="mt-2 text-caption text-muted-foreground">{t("add.newPlaceHint")}</p>

            <label htmlFor="add-other-name" className={cn(LABEL, "mt-3")}>
              {t(placeLatin ? "add.nameBangla" : "add.nameEnglish")}{" "}
              <span className="font-normal text-muted-foreground">({t("add.optional")})</span>
            </label>
            <input
              id="add-other-name"
              className={INPUT}
              value={otherName}
              maxLength={appConfig.text.nameMax}
              placeholder={t(placeLatin ? "add.nameBanglaHint" : "add.nameEnglishHint")}
              onChange={(event) => setOtherName(event.target.value)}
            />
            <div className="mt-3">
              <NameChipsInput
                value={searchNames}
                onChange={setSearchNames}
                max={5}
                label={
                  <>
                    {t("add.searchNames")}{" "}
                    <span className="font-normal text-muted-foreground">({t("add.optional")})</span>
                  </>
                }
                hint={t("add.searchNamesHint")}
                addLabel={t("add.searchNameAdd")}
                removeLabel={(name) => t("add.searchNameRemove", { name })}
                inputClassName="h-14 px-4"
              />
            </div>

            <label htmlFor="add-area" className={cn(LABEL, "mt-3")}>
              {t("add.area")}{" "}
              <span className="font-normal text-muted-foreground">({t("add.optional")})</span>
            </label>
            <input
              id="add-area"
              className={INPUT}
              value={area}
              placeholder={t("add.areaHint")}
              onChange={(event) => setArea(event.target.value)}
            />
            <label htmlFor="add-type" className={cn(LABEL, "mt-3")}>
              {t("add.type")}
            </label>
            <select
              id="add-type"
              className={INPUT}
              value={placeType}
              onChange={(event) => setPlaceType(event.target.value as PlaceType)}
            >
              {PLACE_TYPE_IDS.map((id) => (
                <option key={id} value={id}>
                  {t(`placeType.${id}`)}
                </option>
              ))}
            </select>
            <details className="mt-3 rounded-input border border-border px-3.5 py-2.5">
              <summary className="cursor-pointer text-meta font-semibold">
                {t("add.moreDetails")}
              </summary>
              <label htmlFor="add-phone" className={cn(LABEL, "mt-3")}>
                {t("add.phone")}
              </label>
              <input
                id="add-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                className={INPUT}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <label htmlFor="add-website" className={cn(LABEL, "mt-3")}>
                {t("add.website")}
              </label>
              <input
                id="add-website"
                inputMode="url"
                autoComplete="off"
                className={INPUT}
                value={website}
                placeholder={t("add.websiteHint")}
                onChange={(event) => setWebsite(event.target.value)}
              />
              <label htmlFor="add-hours" className={cn(LABEL, "mt-3")}>
                {t("add.hours")}
              </label>
              <input
                id="add-hours"
                className={INPUT}
                value={hours}
                maxLength={120}
                placeholder={t("add.hoursHint")}
                onChange={(event) => setHours(event.target.value)}
              />
            </details>
            <button
              type="button"
              onClick={useMyLocation}
              className="mt-3 h-11 press rounded-full border border-border px-4 text-sm font-semibold"
            >
              {location ? t("add.locationSet") : t("add.useLocation")}
            </button>
          </>
        )}

        {similar && (
          <div
            role="group"
            aria-label={t("add.similarTitle")}
            className="mt-4 rounded-input border border-warning bg-warning-soft p-3.5"
          >
            <p className="font-semibold">{t("add.similarTitle")}</p>
            <p className="text-meta text-muted-foreground">{t("add.similarHint")}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {similar.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span>
                    {item.nameBn}
                    {item.meta ? (
                      <span className="text-caption text-muted-foreground"> · {item.meta}</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    className="h-10 shrink-0 press rounded-full bg-primary bg-grad-action px-4 text-sm font-semibold text-primary-foreground"
                    onClick={() => {
                      setPlace({ id: item.id, nameBn: item.nameBn });
                      setPlaceQuery(item.nameBn);
                      setSimilar(null);
                      goTo(3);
                    }}
                  >
                    {t("add.itsThis")}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 h-10 press rounded-full border border-border bg-card px-4 text-sm font-semibold"
              onClick={() => {
                setConfirmNew(true);
                setSimilar(null);
                goTo(3);
              }}
            >
              {t("add.notThese")}
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-2 lg:hidden">
          <button
            type="button"
            className="h-12 flex-1 press rounded-button border border-border font-semibold"
            onClick={() => goTo(1)}
          >
            {t("add.back")}
          </button>
          <button
            type="button"
            className="h-12 flex-1 press rounded-button bg-primary bg-grad-action font-semibold text-primary-foreground"
            onClick={() => void checkSimilarThenContinue()}
          >
            {t("add.next")}
          </button>
        </div>
      </section>

      <section className={cn(CARD, show(3))} aria-labelledby="add-how">
        <div className="flex items-center gap-2.5">
          <IconChip tone="violet">
            <HeartIcon />
          </IconChip>
          <h2 id="add-how" className="text-heading">
            {t("add.how")}
          </h2>
        </div>
        <div role="group" aria-labelledby="add-how" className="mt-3 grid grid-cols-3 gap-2">
          {REACTIONS.map(({ id, label, tone }) => (
            <button
              key={id}
              type="button"
              aria-pressed={reaction === id}
              onClick={() => setReaction(id)}
              className={cn(
                "h-16 press rounded-[16px] border-2 text-base font-semibold",
                reaction === id ? tone : "border-transparent bg-background",
              )}
            >
              {t(label)}
            </button>
          ))}
        </div>
        <label htmlFor="add-price" className={cn(LABEL, "mt-4")}>
          {t("add.price")}{" "}
          <span className="font-normal text-muted-foreground">({t("add.optional")})</span>
        </label>
        <input
          id="add-price"
          inputMode="numeric"
          className={INPUT}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
        <label htmlFor="add-comment" className={cn(LABEL, "mt-3")}>
          {t("add.comment")}{" "}
          <span className="font-normal text-muted-foreground">({t("add.optional")})</span>
        </label>
        <input
          id="add-comment"
          className={INPUT}
          maxLength={500}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <div className="mt-4">
          <p className={LABEL}>{t("photos.addOptional")}</p>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div key={photo.preview} className="relative size-20 overflow-hidden rounded-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a picked file */}
                <img src={photo.preview} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  aria-label={t("photos.remove")}
                  onClick={() => removePhoto(index)}
                  className="absolute top-0.5 right-0.5 flex size-7 items-center justify-center rounded-full bg-toast text-toast-fg"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < appConfig.media.maxPhotosPerExperience && (
              <label className="flex size-20 cursor-pointer items-center justify-center rounded-thumb border-2 border-dashed border-border text-sm font-semibold text-muted-foreground">
                {t("photos.add")}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    pickPhotos(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="h-14 flex-1 press rounded-button border border-border font-semibold lg:hidden"
            onClick={() => goTo(2)}
          >
            {t("add.back")}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-14 flex-[2] press rounded-button bg-primary bg-grad-action text-[17px] font-semibold text-primary-foreground disabled:opacity-60 lg:flex-1"
          >
            {t("add.submit")}
          </button>
        </div>
      </section>
    </form>
  );
}
