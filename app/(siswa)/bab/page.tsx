import BelajarPage from "../belajar/page";

export default async function BabIndexPage(props: {
  searchParams?: Promise<{ mapel?: string; babId?: string; semester?: string }>;
}) {
  return <BelajarPage {...props} />;
}
