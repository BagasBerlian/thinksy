import ExamResultClient from "@/components/sesi/ExamResultClient";

export default async function HasilPage({
  params,
}: {
  params: Promise<{ sesiId: string }>;
}) {
  await params;
  return <ExamResultClient />;
}
