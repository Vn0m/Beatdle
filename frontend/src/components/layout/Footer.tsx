export default function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-400 bg-white border-t border-gray-200 font-sans">
      <span className="text-dark font-semibold">Beatdle</span> © 2026 ·{' '}
      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
    </footer>
  );
}
