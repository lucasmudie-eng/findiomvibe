// src/app/providers/manage/page.tsx
export default function ManageProviderPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <h1 className="text-2xl font-semibold text-gray-900">Manage listing</h1>

      <section id="logo" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-gray-900">Logo</h2>
        <p className="text-sm text-gray-600">Upload a square logo…</p>
        {/* TODO: form */}
      </section>

      <section id="summary" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
        {/* TODO */}
      </section>

      <section id="services" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-gray-900">Services & pricing</h2>
        {/* TODO */}
      </section>

      <section id="areas" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-gray-900">Areas served</h2>
        {/* TODO */}
      </section>

      <section id="contact" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-gray-900">Contact details</h2>
        {/* TODO */}
      </section>

      <section id="photos" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
        {/* TODO */}
      </section>

      <section id="about" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-gray-900">About</h2>
        {/* TODO */}
      </section>
    </main>
  );
}