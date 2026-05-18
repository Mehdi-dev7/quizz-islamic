interface PageLoaderProps {
  bg?: string;
  emoji?: string;
}

export function PageLoader({ bg = 'bg-linear-to-br from-green-50 via-blue-50 to-purple-50', emoji = '🕌' }: PageLoaderProps) {
  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center`}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
      </div>
    </div>
  );
}
