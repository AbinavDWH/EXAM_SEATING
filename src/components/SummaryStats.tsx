import { SeatingResult } from '../js/seatingAlgorithm';

interface SummaryStatsProps {
  result: SeatingResult;
}

export default function SummaryStats({ result }: SummaryStatsProps) {
  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{result.totalStudents}</p>
          <p className="text-xs text-slate-400 mt-1">Students</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{result.rooms.length}</p>
          <p className="text-xs text-slate-400 mt-1">Rooms</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{result.totalSeats}</p>
          <p className="text-xs text-slate-400 mt-1">Total Seats</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 text-center">
          <p className={`text-2xl font-bold ${result.conflictCount === 0 ? 'text-green-400' : 'text-red-400'}`}>
            {result.conflictCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Conflicts</p>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
          <h3 className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
            ⚠️ Warnings
          </h3>
          <ul className="space-y-1">
            {result.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-200/80">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Unassigned Students */}
      {result.unassigned && result.unassigned.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold text-sm mb-2">
            Unassigned Students ({result.unassigned.length})
          </h3>
          <p className="text-sm text-red-200/80">
            These students could not be assigned seats. Consider adding more rooms.
          </p>
        </div>
      )}
    </div>
  );
}
