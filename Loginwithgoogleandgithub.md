## STEP 1 — Setup Google OAuth

### 1a. Buat Credentials di Google Cloud Console

1. Buka **[console.cloud.google.com](https://console.cloud.google.com)**
2. Buat project baru atau pilih yang sudah ada
3. Pergi ke **APIs & Services → OAuth consent screen**
   - Pilih **External**, klik **Create**
   - Isi App name: `Thinksy`, User support email, Developer contact
   - Klik **Save and Continue** sampai selesai
4. Pergi ke **APIs & Services → Credentials**
5. Klik **+ Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Name: `Thinksy`
   - **Authorized redirect URIs** → tambahkan:

     ```
     https://mtpnbviztquitgszrfel.supabase.co/auth/v1/callback
     ```

6. Klik **Create** → Salin `Client ID` dan `Client Secret`

---

### 1b. Buat Credentials di GitHub

1. Buka **[github.com/settings/developers](https://github.com/settings/developers)**
2. Klik **New OAuth App**
   - Application name: `Thinksy`
   - Homepage URL: `http://localhost:3000` (nanti ganti ke domain production)
   - **Authorization callback URL**:

     ```
     https://mtpnbviztquitgszrfel.supabase.co/auth/v1/callback
     ```

3. Klik **Register application**
4. Di halaman app, klik **Generate a new client secret**
5. Salin `Client ID` dan `Client Secret`

---

## STEP 2 — Aktifkan Provider di Supabase Dashboard

1. Buka **[supabase.com/dashboard](https://supabase.com/dashboard)** → pilih project `mtpnbviztquitgszrfel`
2. Pergi ke **Authentication → Providers**

**Untuk Google:**

- Temukan **Google** → toggle **Enable**
- Paste `Client ID` dan `Client Secret` dari Step 1a
- **Authorized Client IDs** (untuk mobile, optional)
- Klik **Save**

**Untuk GitHub:**

- Temukan **GitHub** → toggle **Enable**
- Paste `Client ID` dan `Client Secret` dari Step 1b
- Klik **Save**

---

## STEP 3 — Tambahkan Site URL di Supabase

Masih di Supabase Dashboard:

1. Pergi ke **Authentication → URL Configuration**
2. **Site URL** → `http://localhost:3000` (untuk development)
3. **Redirect URLs** → tambahkan:

   ```
   http://localhost:3000/api/auth/callback
   ```

4. Klik **Save**

---

## STEP 4 — Handle Profil untuk OAuth User

Ini bagian penting! User yang login via Google/GitHub **tidak punya data `profil`** di tabel kamu karena mereka tidak melalui form `registerAction`.

Kamu perlu tambahkan **Database Trigger** di Supabase agar profil otomatis dibuat. Buka **SQL Editor** di Supabase dan jalankan:

```sql
-- Trigger untuk membuat profil otomatis saat user OAuth mendaftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profil (id, nama_lengkap, peran)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'siswa'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pastikan trigger sudah ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---
