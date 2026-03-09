export default function ErrorMessage({ message }) {
  return (
    <div className="animate-fade-in rounded-lg bg-white border border-red-200 px-5 py-4">
      <p className="text-sm text-red-700">
        <span className="font-semibold">Red card:</span> {message}
      </p>
    </div>
  );
}
