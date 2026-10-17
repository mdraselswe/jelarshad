import { RouteSkeleton } from "@/components/layout/route-skeleton";
import { AddPageSkeleton } from "@/features/add/components/add-page-skeleton";
import { AdminFrameSkeleton } from "@/features/admin/components/admin-frame";
import { LoginPromptSkeleton } from "@/features/auth/components/login-prompt";
import { AreaPageSkeleton } from "@/features/district/components/area-page";
import { BrandPageSkeleton } from "@/features/brand/components/brand-page";
import { PersonPageSkeleton } from "@/features/leaderboard/components/person-page";
import { IndexPageSkeleton } from "@/features/catalog/components/index-page";
import { DistrictFoodPageSkeleton } from "@/features/district/components/district-food-page";
import { DistrictPageSkeleton } from "@/features/district/components/district-page";
import { FoodPageSkeleton } from "@/features/food/components/food-page";
import { HomePageSkeleton } from "@/features/home/components/home-page";
import { LeaderboardPageSkeleton } from "@/features/leaderboard/components/leaderboard-page";
import { LegalPageSkeleton } from "@/features/legal/components/legal-page";
import { MePageSkeleton, MeProfilePageSkeleton } from "@/features/me/components/me-page";
import { PlacePageSkeleton } from "@/features/place/components/place-page";
import { SearchPageSkeleton } from "@/features/search/components/search-page";

// The group's own page is the home page, but every route without a loading.tsx of its own (and the
// first paint of a dynamic route) falls back to this. Showing the home shape for them made every
// page jump when its content arrived, so the skeleton that belongs to the address is picked here.
export default function Loading() {
  return (
    <RouteSkeleton
      variants={{
        home: <HomePageSkeleton />,
        search: <SearchPageSkeleton />,
        food: <FoodPageSkeleton />,
        place: <PlacePageSkeleton />,
        brand: <BrandPageSkeleton />,
        leaderboard: <LeaderboardPageSkeleton />,
        index: <IndexPageSkeleton />,
        people: <PersonPageSkeleton />,
        district: <DistrictPageSkeleton />,
        districtFood: <DistrictFoodPageSkeleton />,
        area: <AreaPageSkeleton />,
        me: <MePageSkeleton />,
        profile: <MeProfilePageSkeleton />,
        add: <AddPageSkeleton />,
        login: <LoginPromptSkeleton />,
        legal: <LegalPageSkeleton />,
        policy: <LegalPageSkeleton sections={5} titleLines={2} />,
        admin: <AdminFrameSkeleton />,
      }}
    />
  );
}
