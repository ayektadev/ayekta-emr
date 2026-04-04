export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8 max-w-3xl font-clinical">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600">
        This screen is not available yet. Use Patients to open charts, or Settings to adjust your workspace.
      </p>
    </div>
  );
}
