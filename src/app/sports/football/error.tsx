"use client";
export default function ErrorState() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">Couldn’t load football data right now. Please try again.</p>
    </div>
  );
}