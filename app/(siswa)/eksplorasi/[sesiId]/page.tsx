export default function ModeEksplorasiPage({ params }: { params: { sesiId: string } }) {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <div className="w-full md:w-3/5 p-6 bg-white border-r border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Mode Eksplorasi (Soal Kurasi AI) #{params?.sesiId}</h1>
      </div>
      <div className="w-full md:w-2/5 p-6 bg-slate-50">
        <h2 className="text-lg font-bold text-primary">thinksy AI 🤖</h2>
      </div>
    </main>
  );
}
