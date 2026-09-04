import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface CreateNotificationParams {
  userId: string;
  judul: string;
  pesan: string;
  tipe?: "info" | "urgent" | "success" | "warning";
}

/**
 * Universal helper untuk membuat notifikasi sistem ke database.
 * Dapat dipanggil dari route handler, server action, atau service mana pun tanpa konfigurasi rumit.
 *
 * Contoh penggunaan:
 * ```ts
 * await createSystemNotification({
 *   userId: user.id,
 *   judul: "Misi Harian Selesai! 🎉",
 *   pesan: "Kamu telah menyelesaikan misi Presensi (+20 Poin)",
 *   tipe: "success",
 * });
 * ```
 */
export async function createSystemNotification({
  userId,
  judul,
  pesan,
  tipe = "info",
}: CreateNotificationParams) {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("notifikasi")
      .insert({
        user_id: userId,
        judul,
        pesan,
        tipe,
        dibaca: false,
      })
      .select()
      .single();

    if (error) {
      console.warn("[NOTIFICATION INSERT WARNING]:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, notification: data };
  } catch (err: any) {
    console.warn("[NOTIFICATION INSERT ERROR]:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Helper untuk menandai notifikasi sebagai dibaca.
 */
export async function markNotificationsAsRead(userId: string, notificationId?: string) {
  try {
    const adminDb = createAdminClient();
    let query = adminDb
      .from("notifikasi")
      .update({ dibaca: true })
      .eq("user_id", userId);

    if (notificationId) {
      query = query.eq("id", notificationId);
    }

    const { error } = await query;
    return { success: !error };
  } catch {
    return { success: false };
  }
}
