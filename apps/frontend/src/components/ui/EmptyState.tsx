export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
      <p className="text-lg font-medium text-gray-400">{title}</p>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}
