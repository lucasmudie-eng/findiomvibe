export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-gray-600">
        Manage notifications, contact email/phone and account preferences.
      </p>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-2 text-lg font-medium">Notifications</h2>
        <p className="text-sm text-gray-600">
          Choose where enquiries are sent (email, SMS – SMS coming soon).
        </p>
      </div>
    </div>
  );
}