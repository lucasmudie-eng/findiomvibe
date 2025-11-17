// src/app/dashboard/leads/page.tsx
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Lead = {
  id: string;
  created_at: string;
  provider_slug: string;
  provider_name: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
};

export default async function LeadsPage() {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select(
      "id, created_at, provider_slug, provider_name, name, email, message, handled"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 text-4xl font-semibold">Enquiries</h1>
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          Failed to load leads: {error.message}
        </p>
      </main>
    );
  }

  const leads = (data ?? []) as Lead[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-semibold">Enquiries</h1>

      {leads.length === 0 ? (
        <p className="text-gray-600">No enquiries yet.</p>
      ) : (
        <ul className="space-y-4">
          {leads.map((l) => (
            <li key={l.id} className="rounded-xl border bg-white p-4">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium">
                  {l.provider_name}{" "}
                  <span className="text-sm text-gray-500">/ {l.provider_slug}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(l.created_at).toLocaleString()}
                </div>
              </div>

              <div className="text-sm text-gray-700">
                From: <span className="font-medium">{l.name}</span> — {l.email}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-gray-800">{l.message}</p>

              <div className="mt-3">
                <span
                  className={
                    "inline-flex rounded-full px-2 py-0.5 text-xs " +
                    (l.handled
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-yellow-50 text-yellow-800 border border-yellow-200")
                  }
                >
                  {l.handled ? "Handled" : "New"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}