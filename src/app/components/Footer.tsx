import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50/60">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-gray-500">
        <NewsletterSignup />
        <p>© {new Date().getFullYear()} ManxHive. All rights reserved.</p>
      </div>
    </footer>
  );
}
