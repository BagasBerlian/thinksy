export default function GuruDetailSiswaPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">Detail Progress & Log AI Siswa #{params?.id}</h1>
    </div>
  );
}
