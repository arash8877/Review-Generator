interface EmailStatsOverviewProps {
  totalEmails: number;
  pendingCount: number;
  answeredCount: number;
  negativeCount: number;
  answerRate: number;
}

export function EmailStatsOverview({
  totalEmails,
  pendingCount,
  answeredCount,
  negativeCount,
  answerRate,
}: EmailStatsOverviewProps) {
  return (
    <div className="grid gap-6 mb-6 lg:grid-cols-[320px,1fr] items-stretch">
      <div className="glass-card rounded-2xl p-4 border border-blue-400/30 h-full">
        <p className="text-xs uppercase text-blue-100/70 font-semibold">Inbox volume</p>
        <p className="text-3xl font-bold text-blue-200 mt-2">{totalEmails}</p>
        <p className="text-[11px] text-blue-100/70">Customer emails across all products</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="glass-card rounded-2xl p-4 border border-emerald-400/30">
          <p className="text-xs uppercase text-emerald-100/70 font-semibold">Response rate</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-emerald-200">{answerRate}%</p>
            <span className="text-sm text-emerald-100/80">{answeredCount} replied</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${answerRate}%` }} />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-pink-400/30">
          <p className="text-xs uppercase text-pink-100/70 font-semibold">High-risk tone</p>
          <p className="text-3xl font-bold text-pink-200 mt-2">{negativeCount}</p>
          <p className="text-[11px] text-pink-100/70">Negative or escalated notes</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-cyan-400/30">
          <p className="text-xs uppercase text-cyan-100/70 font-semibold">Waiting replies</p>
          <p className="text-3xl font-bold text-cyan-200 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-cyan-100/60">Emails that still need action</p>
        </div>
      </div>
    </div>
  );
}
