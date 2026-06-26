export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--muted)]">
      <div className="cultural-divider mb-6 mx-auto" style={{ maxWidth: '360px' }} />
      <p className="footer-inclusion">
        本术语库涵盖中国各民族及世界范围内的民俗学知识。我们尊重每一种文化传统的表达方式，
        致力于以学术严谨的态度呈现多元文化的丰富性。术语的中文译名、民族语言标注和分类体系
        力求准确反映各文化共同体的自我理解。
      </p>
      <div className="mt-5">
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
      </div>
    </footer>
  );
}
