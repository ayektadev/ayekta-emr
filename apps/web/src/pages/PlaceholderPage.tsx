export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600">
        This route is wired for Ayekta v2. Clinical and admin features will land in upcoming phases.
      </p>
    </div>
  );
}
