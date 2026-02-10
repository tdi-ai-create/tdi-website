export default function HubLoading() {
  return (
    <div
      className="min-h-[calc(100vh-60px)] flex items-center justify-center"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"
          style={{ backgroundColor: '#E8B84B' }}
        />
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
