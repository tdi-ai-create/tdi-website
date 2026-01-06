export function AnnouncementBar() {
  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-center"
      style={{ backgroundColor: '#1e2749' }}
    >
      <p className="text-sm text-center" style={{ color: '#ffffff' }}>
        Already a member?{' '}
        <a
          href="https://tdi.thinkific.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#ffba06' }}
        >
          Go to Learning Hub →
        </a>
      </p>
    </div>
  );
}
