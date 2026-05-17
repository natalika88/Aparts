type PersonalDataNoticeLabels = {
  title: string;
  protected: string;
  noAi: string;
  mergeOnly: string;
  consent: string;
};

export function PersonalDataNotice({
  labels,
  compact = false,
}: {
  labels: PersonalDataNoticeLabels;
  compact?: boolean;
}) {
  return (
    <aside
      className={`rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 ${
        compact ? "p-3" : "p-4"
      }`}
      role="note"
      aria-label={labels.title}
    >
      <p className={`font-medium text-[var(--text)] ${compact ? "text-sm" : "text-base"}`}>
        {labels.title}
      </p>
      <ul className={`mt-2 space-y-1.5 text-[var(--muted)] ${compact ? "text-xs" : "text-sm"}`}>
        <li className="flex gap-2">
          <span className="text-[var(--accent)]" aria-hidden>
            ✓
          </span>
          <span>{labels.protected}</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[var(--accent)]" aria-hidden>
            ✓
          </span>
          <span>{labels.noAi}</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[var(--accent)]" aria-hidden>
            ✓
          </span>
          <span>{labels.mergeOnly}</span>
        </li>
      </ul>
    </aside>
  );
}
