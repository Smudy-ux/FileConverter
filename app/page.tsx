import FileInputButton from "./components/FileInputButton";


export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-6">
      <section className="max-w-4xl mx-auto text-center mb-12 mt-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to Free<span className="text-blue-500">Converter</span></h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Are you bored with countless ads that you need to watch before converting your files? I solved your problem, just convert your files locally with this free tool.</p>
      </section>


      <section className="max-w-3xl mx-auto align-middle">
        <FileInputButton />
      </section>
    </main>
  );
}
