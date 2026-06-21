export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--muted)]">
      <p>
        中国民俗学术语库 © 2026 史骞升编撰 ·{' '}
        <a
          href="https://github.com/2947718465-dot/folklore-terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          开源共享
        </a>
      </p>
      <p className="mt-1 opacity-50">
        内容遵循 CC BY-NC 4.0 协议，转载或引用请注明出处
      </p>
    </footer>
  );
}
