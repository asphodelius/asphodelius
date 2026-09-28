import DigitalAsphodelusPortfolio from "../components/DigitalAsphodelusPortfolio";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Portfolio.meta" });
  return { title: t("title"), description: t("description") };
}

export default function LocalePage() {
  return <DigitalAsphodelusPortfolio />;
}
