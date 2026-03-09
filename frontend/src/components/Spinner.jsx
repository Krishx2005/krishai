export default function Spinner() {
  return (
    <div className="flex items-center gap-3 py-6 text-pitch-dark/60">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-pitch/20 border-t-pitch" />
      <span className="text-sm">Generating query...</span>
    </div>
  );
}
