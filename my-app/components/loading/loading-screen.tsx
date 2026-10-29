import { getTranslations } from "next-intl/server";
import { RouteSkeleton, type RouteSkeletonKind } from "@/components/loading/route-skeleton";

export async function LoadingScreen({ kind }: { kind: RouteSkeletonKind }) {
  const t = await getTranslations("Settings");
  return <RouteSkeleton kind={kind} label={t("loading")} />;
}
