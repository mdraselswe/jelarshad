def sub(f, a, b):
    t = open(f, encoding="utf8").read()
    assert a in t, (f, a[:60])
    open(f, "w", encoding="utf8").write(t.replace(a, b, 1))


# photos section -> showcase, placed under the hero
sub(
    "src/features/place/components/place-photos-section.tsx",
    """import { CameraIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { PhotoStrip } from "@/features/media/components/photo-strip";
""",
    """import { PhotoShowcase } from "@/features/media/components/photo-showcase";
""",
)
sub(
    "src/features/place/components/place-photos-section.tsx",
    """  return (
    <Section title={t("photos.section")} icon={<CameraIcon />} tone="amber">
      <PhotoStrip photos={photos} label={t("photos.section")} size={104} />
    </Section>
  );""",
    """  return <PhotoShowcase photos={photos} label={t("photos.section")} />;""",
)
sub(
    "src/features/place/components/place-photos-section.tsx",
    "/** Photos people shared from this place; nothing is shown (and no space kept) when there are none. */",
    "/** Photos people shared, right under the hero; nothing is shown (and no space kept) when there are none. */",
)
p = "src/features/place/components/place-page.tsx"
sub(
    p,
    """      <Suspense fallback={null}>
        <PlacePhotosSection placeId={place.id} />
      </Suspense>
    </PageShell>""",
    """    </PageShell>""",
)
sub(
    p,
    """      <div className="lg:grid lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Suspense fallback={<PlaceDishesSectionSkeleton />}>""",
    """      <Suspense fallback={null}>
        <PlacePhotosSection placeId={place.id} />
      </Suspense>
      <div className="lg:grid lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Suspense fallback={<PlaceDishesSectionSkeleton />}>""",
)

# claim creator
sub(
    "src/core/domain/community.ts",
    """  lastConfirmedAt: Date | null;
  expiresAt: Date | null;
};

export type ClaimVote""",
    """  lastConfirmedAt: Date | null;
  expiresAt: Date | null;
  /** Who added the fact; they cannot vote on it, others verify it. */
  createdBy: string | null;
};

export type ClaimVote""",
)
sub(
    "src/infrastructure/supabase/mappers.ts",
    """    lastConfirmedAt: date(row.last_confirmed_at),
    expiresAt: date(row.expires_at),
  };
}

export function toMediaRef""",
    """    lastConfirmedAt: date(row.last_confirmed_at),
    expiresAt: date(row.expires_at),
    createdBy: row.created_by,
  };
}

export function toMediaRef""",
)
sub(
    "src/infrastructure/mock/repositories.ts",
    """            lastConfirmedAt: null,
            expiresAt: null,
          };""",
    """            lastConfirmedAt: null,
            expiresAt: null,
            createdBy: input.createdBy ?? null,
          };""",
)
sub(
    "src/services/claim-service.ts",
    """      if (!before) return fail("not_found");
""",
    """      if (!before) return fail("not_found");
      // Whoever added a fact cannot confirm it themselves; verifying is for other people.
      if (before.createdBy === user.id) return fail("forbidden");
""",
)
sub(
    "src/services/catalog-service.ts",
    """        lastConfirmedAt: claim.lastConfirmedAt,
        expiresAt: claim.expiresAt,
      }));
    },""",
    """        lastConfirmedAt: claim.lastConfirmedAt,
        expiresAt: claim.expiresAt,
        createdBy: claim.createdBy,
      }));
    },""",
)
print("ok")
