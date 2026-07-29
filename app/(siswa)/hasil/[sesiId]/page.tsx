export default function HasilPage({ params }: { params: { sesiId: string } }) {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm border border-slate-200 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Laporan Hasil Sesi #{params?.sesiId}</h1>
        <div className="text-4xl font-extrabold text-primary">85 / 100</div>
        <p className="text-sm text-slate-600">Kerja bagus! Evaluasi dan pembahasan dapat dilihat di bawah.</p>
      </div>
    </main>
  );
}
