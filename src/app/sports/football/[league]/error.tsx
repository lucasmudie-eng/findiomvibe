"use client";
export default function ErrorLeague() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">League failed to load</h1>
      <p className="text-sm text-muted-foreground">Please refresh or try another league.</p>
    </div>
  );
}