import { createClient } from "@/lib/supabase/server";
import ExamPracticeClient from "@/components/sesi/ExamPracticeClient";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ sesiId: string }>;
  searchParams: Promise<{ mode?: "latihan" | "inclass"; babId?: string }>;
}) {
  const { sesiId } = await params;
  const { mode, babId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profil } = user
    ? await supabase
        .from("profil")
        .select("nama_lengkap")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <ExamPracticeClient
      sesiId={sesiId}
      mode={mode || "latihan"}
      judulSesi={
        mode === "inclass"
          ? "EVALUASI BAB - ASESMEN TOPIK IN-CLASS"
          : "UJIAN AKHIR SEMESTER - PRACTICE EXAM"
      }
      soalList={[]}
      namaSiswa={profil?.nama_lengkap ?? "Budi Kartika"}
    />
  );
}
