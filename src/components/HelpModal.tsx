import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ExternalLink, Mail } from 'lucide-react';

const STORAGE_KEY = 'welcome-dismissed';

interface HelpModalProps {
  show: boolean;
  onClose: () => void;
}

export function HelpModal({ show, onClose }: HelpModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    onClose();
  }, [dontShowAgain, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 h-8 w-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[var(--ink)]">民俗学术语库</h2>
                    <p className="text-xs text-[var(--muted)]">v1.0 · 个人编撰维护</p>
                  </div>
                </div>

                {/* Intro */}
                <p className="text-sm leading-relaxed text-[var(--muted)] mb-4">
                  收录<span className="text-[var(--ink)] font-medium"> 5,000+ </span>
                  条民俗学专业术语，涵盖民俗事象、理论术语、研究方法、学科概念、研究关键词、学者与学术体制六个分类。
                </p>

                {/* Usage */}
                <div className="rounded-xl bg-[var(--paper)] p-4 mb-4">
                  <h3 className="text-xs font-semibold text-[var(--ink)] mb-2">使用方式</h3>
                  <div className="space-y-1.5 text-xs text-[var(--muted)] leading-relaxed">
                    <p>· 搜索框支持中英文及拼音首字母检索</p>
                    <p>· 按分类、子分类逐层筛选浏览</p>
                    <p>· 点击术语卡片查看完整释义，支持收藏和复制</p>
                    <p>· 右上角可切换深色模式，方便夜间阅读</p>
                  </div>
                </div>

                {/* Feedback */}
                <div className="rounded-xl bg-[var(--paper)] p-4 mb-4">
                  <h3 className="text-xs font-semibold text-[var(--ink)] mb-2">反馈</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">
                    如发现术语释义有误、缺少重要条目、分类不当或翻译需修正，欢迎反馈。
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://github.com/2947718465-dot/folklore-terms/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-[var(--accent)] hover:underline w-fit"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      GitHub Issues
                    </a>
                    <a
                      href="mailto:2947718465@qq.com"
                      className="inline-flex items-center gap-2 text-xs text-[var(--accent)] hover:underline w-fit"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      2947718465@qq.com
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                    />
                    <span className="text-xs text-[var(--muted)]">不再显示</span>
                  </label>
                  <button
                    onClick={handleDismiss}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  >
                    知道了
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useWelcomeModal(): [boolean, () => void] {
  const [show, setShow] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) !== '1';
  });

  const close = useCallback(() => setShow(false), []);

  return [show, close];
}
