import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import GuruLayout from "@/components/guru/GuruLayout";
import GuruBiayaClient, {
  LogAiItem,
  DailyAggregate,
  FeatureAggregate,
} from "@/components/guru/GuruBiayaClient";

export default async function GuruBiayaPage() {
  const supabase = await createClient();
  const adminDb = createAdminClient();

  // 1. Fetch user profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profil } = user
    ? await supabase
        .from("profil")
        .select("nama_lengkap, email, peran")
        .eq("id", user.id)
        .single()
    : { data: null };

  // 2. Fetch all log_ai rows via adminDb
  const { data: rawLogs } = await adminDb
    .from("log_ai")
    .select(`
      id,
      fitur,
      prompt_tokens,
      completion_tokens,
      total_tokens,
      biaya_usd,
      dibuat_pada
    `)
    .order("dibuat_pada", { ascending: false });

  const logs: LogAiItem[] = (rawLogs || []).map((l: any) => ({
    id: l.id,
    fitur: l.fitur,
    prompt_tokens: Number(l.prompt_tokens) || 0,
    completion_tokens: Number(l.completion_tokens) || 0,
    total_tokens: Number(l.total_tokens) || 0,
    biaya_usd: Number(l.biaya_usd) || 0,
    biaya_idr: Math.round((Number(l.biaya_usd) || 0) * 16000),
    dibuat_pada: l.dibuat_pada,
  }));

  // 3. Compute Aggregates
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalTokens = 0;
  let totalBiayaUsd = 0;

  const todayIso = new Date().toISOString().split("T")[0];
  let todayPromptTokens = 0;
  let todayCompletionTokens = 0;
  let todayTokens = 0;
  let todayCostIdr = 0;

  const dailyMap: Record<
    string,
    {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      costUsd: number;
    }
  > = {};

  const featureMap: Record<
    string,
    {
      count: number;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      costUsd: number;
    }
  > = {
    tutor_sokratik: {
      count: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      costUsd: 0,
    },
    grading_esai: {
      count: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      costUsd: 0,
    },
    generate_soal: {
      count: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      costUsd: 0,
    },
  };

  logs.forEach((item) => {
    totalPromptTokens += item.prompt_tokens;
    totalCompletionTokens += item.completion_tokens;
    totalTokens += item.total_tokens;
    totalBiayaUsd += item.biaya_usd;

    const dateKey = item.dibuat_pada.split("T")[0];
    if (dateKey === todayIso) {
      todayPromptTokens += item.prompt_tokens;
      todayCompletionTokens += item.completion_tokens;
      todayTokens += item.total_tokens;
      todayCostIdr += item.biaya_idr;
    }

    // Daily group
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0,
      };
    }
    dailyMap[dateKey].promptTokens += item.prompt_tokens;
    dailyMap[dateKey].completionTokens += item.completion_tokens;
    dailyMap[dateKey].totalTokens += item.total_tokens;
    dailyMap[dateKey].costUsd += item.biaya_usd;

    // Feature group
    if (!featureMap[item.fitur]) {
      featureMap[item.fitur] = {
        count: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0,
      };
    }
    featureMap[item.fitur].count += 1;
    featureMap[item.fitur].promptTokens += item.prompt_tokens;
    featureMap[item.fitur].completionTokens += item.completion_tokens;
    featureMap[item.fitur].totalTokens += item.total_tokens;
    featureMap[item.fitur].costUsd += item.biaya_usd;
  });

  const totalBiayaIdr = Math.round(totalBiayaUsd * 16000);

  // If today has no records, set a baseline so the UI shows today's summary gracefully
  if (!dailyMap[todayIso]) {
    dailyMap[todayIso] = {
      promptTokens: todayPromptTokens,
      completionTokens: todayCompletionTokens,
      totalTokens: todayTokens,
      costUsd: todayCostIdr / 16000,
    };
  }

  const dailyAggregates: DailyAggregate[] = Object.entries(dailyMap)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, val]) => ({
      date,
      promptTokens: val.promptTokens,
      completionTokens: val.completionTokens,
      totalTokens: val.totalTokens,
      costUsd: val.costUsd,
      costIdr: Math.round(val.costUsd * 16000),
    }));

  const featureLabels: Record<string, string> = {
    tutor_sokratik: "Tutor Sokratik Siswa",
    grading_esai: "Koreksi Esai Otomatis",
    generate_soal: "Generator Bank Soal",
  };

  const featureAggregates: FeatureAggregate[] = Object.entries(featureMap).map(
    ([fitur, val]) => ({
      fitur,
      label: featureLabels[fitur] || fitur,
      count: val.count,
      promptTokens: val.promptTokens,
      completionTokens: val.completionTokens,
      totalTokens: val.totalTokens,
      costIdr: Math.round(val.costUsd * 16000),
    })
  );

  const summary = {
    totalPromptTokens,
    totalCompletionTokens,
    totalTokens,
    totalBiayaUsd,
    totalBiayaIdr,
    todayPromptTokens,
    todayCompletionTokens,
    todayTokens,
    todayCostIdr,
  };

  return (
    <GuruLayout
      userProfile={
        profil
          ? {
              nama_lengkap: profil.nama_lengkap,
              email: profil.email,
              peran: profil.peran,
            }
          : undefined
      }
    >
      <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-24">
        <GuruBiayaClient
          summary={summary}
          dailyAggregates={dailyAggregates}
          featureAggregates={featureAggregates}
          recentLogs={logs}
        />
      </div>
    </GuruLayout>
  );
}
