import { createClient } from "@/lib/supabase/server";
import DaftarMateriClient from "./DaftarMateriClient";

export default async function DetailBabPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ materiId?: string }>;
}) {
  const { id } = await params;
  const { materiId } = await searchParams;
  const supabase = await createClient();

  const { data: babData } = await supabase
    .from("bab")
    .select(
      `
      id,
      judul,
      deskripsi,
      urutan,
      materi (
        id,
        judul,
        konten_markdown,
        urutan
      )
    `
    )
    .eq("id", id)
    .single();

  const listMateri =
    babData?.materi?.sort((a: any, b: any) => a.urutan - b.urutan) || [];

  return (
    <DaftarMateriClient
      babId={id}
      judulBab={babData?.judul || "Bab 1: Pola Bilangan & Barisan Bilangan"}
      deskripsiBab={
        babData?.deskripsi ||
        "CP: Menggeneralisasi pola susunan benda dan barisan bilangan. TP: Menentukan suku ke-n (Un) dan jumlah n suku (Sn) pada barisan aritmetika dan geometri."
      }
      urutanBab={babData?.urutan || 1}
      listMateri={listMateri}
      initialMateriId={materiId}
    />
  );
}
