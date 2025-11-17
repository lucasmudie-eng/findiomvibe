export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Business profile</h1>
      <p className="text-gray-600">
        Manage your listing details, services, areas served, contact info and photos.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-2 text-lg font-medium">Logo & photos</h2>
          <p className="text-sm text-gray-600">Upload a square logo and at least 3 photos.</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-2 text-lg font-medium">Summary</h2>
          <p className="text-sm text-gray-600">Short intro that appears on your card.</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-2 text-lg font-medium">Services & pricing</h2>
          <p className="text-sm text-gray-600">Add clear service names and simple prices.</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-2 text-lg font-medium">Areas served</h2>
          <p className="text-sm text-gray-600">Select the towns you cover.</p>
        </div>
      </div>
    </div>
  );
}