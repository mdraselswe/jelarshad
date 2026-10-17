import { MessageCircleIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList } from "@/components/ui/grouped-list";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import type { Reaction } from "@/core/domain";
import { PhotoStrip } from "@/features/media/components/photo-strip";
import { getT } from "@/i18n/server";
import { timeAgo } from "@/lib/format/date";
import { formatTaka } from "@/lib/format/number";

import { getPlaceExperiences } from "../queries";

const REACTION_EMOJI: Record<Reaction, string> = { loved: "😍", okay: "🙂", disliked: "😕" };
const ITEM_CLASS = "flex gap-3 p-3";

/** "মানুষ যা বলছেন": what people wrote about this place's dishes; nothing when nobody has written. */
export async function PlaceVoicesSection({ placeId }: { placeId: string }) {
  const t = getT();
  const { items, asOf } = await getPlaceExperiences(placeId);
  if (items.length === 0) return null;
  return (
    <Section title={t("place.voices")} icon={<MessageCircleIcon />} tone="violet">
      <GroupedList split>
        {items.map((experience) => (
          <li key={experience.id} className={ITEM_CLASS}>
            <span aria-hidden className="text-2xl leading-none">
              {REACTION_EMOJI[experience.reaction]}
            </span>
            <div className="min-w-0 flex-1">
              {experience.comment ? (
                <p className="text-body">
                  <span className="sr-only">{t(`reaction.${experience.reaction}`)}: </span>
                  {experience.comment}
                </p>
              ) : (
                <p className="text-body text-muted-foreground">
                  {t(`reaction.${experience.reaction}`)}
                </p>
              )}
              {experience.photos.length > 0 && (
                <div className="mt-2">
                  <PhotoStrip photos={experience.photos} label={t("photos.section")} size={72} />
                </div>
              )}
              <p className="mt-1 text-caption text-muted-foreground">
                {[
                  experience.subject,
                  experience.userName,
                  experience.pricePaid !== null ? formatTaka(experience.pricePaid) : null,
                  timeAgo(experience.createdAt, asOf),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </GroupedList>
    </Section>
  );
}

export function PlaceVoicesSectionSkeleton() {
  const t = getT();
  return (
    <Section title={t("place.voices")} icon={<MessageCircleIcon />} tone="violet">
      <GroupedList>
        {[0, 1].map((index) => (
          <li key={index} className={ITEM_CLASS}>
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <SkeletonText lines={2} className="text-body" />
              <SkeletonText className="mt-1 w-1/2 text-caption" />
            </div>
          </li>
        ))}
      </GroupedList>
    </Section>
  );
}
