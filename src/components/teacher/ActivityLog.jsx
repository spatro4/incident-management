import { CalendarClock } from 'lucide-react'

export default function ActivityLog({ activityLog }) {
  return (
    <div className="card-playful p-5">
      <h3 className="font-display font-bold text-slate-700 mb-4 flex items-center gap-2">
        <CalendarClock size={18} className="text-indigo-400" /> Daily Login & Completion Log
      </h3>
      {activityLog.length === 0 ? (
        <p className="text-sm text-slate-400">No activity recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Chapters</th>
                <th className="pb-2 pr-4">Mode</th>
                <th className="pb-2 pr-4">Score</th>
                <th className="pb-2">Math Points</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="py-2 pr-4 text-slate-600 font-bold whitespace-nowrap">
                    {new Date(log.date).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">{log.chapterTitles}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        log.mode === 'exam'
                          ? 'bg-amber-100 text-amber-600'
                          : log.mode === 'olympiad'
                            ? 'bg-slate-800 text-white'
                            : 'bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      {log.mode === 'exam' ? 'Assigned Exam' : log.mode === 'olympiad' ? 'Olympiad Paper' : 'Daily Quest'}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`font-display font-extrabold ${
                        log.scorePercent >= 70 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {log.scorePercent}%
                    </span>
                    <span className="text-slate-400 text-xs ml-1">
                      ({log.correct}/{log.total})
                    </span>
                  </td>
                  <td className="py-2 font-bold text-slate-600">+{log.xpEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
