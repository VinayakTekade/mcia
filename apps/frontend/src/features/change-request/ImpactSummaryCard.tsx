import { Link } from 'react-router-dom';
import type { ImpactSummary } from './types';

interface ImpactSummaryCardProps {
  summary: ImpactSummary;
  changeRequestId: string;
}

const RISK_STYLES: Record<string, string> = {
  LOW: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
};

const RISK_BG: Record<string, string> = {
  LOW: 'bg-green-900/20 border-green-800/30',
  MEDIUM: 'bg-yellow-900/20 border-yellow-800/30',
  HIGH: 'bg-orange-900/20 border-orange-800/30',
  CRITICAL: 'bg-red-900/20 border-red-800/30',
};

export default function ImpactSummaryCard({ summary, changeRequestId }: ImpactSummaryCardProps) {
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${RISK_BG[summary.riskLevel] || RISK_BG.LOW}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Impact Analysis</h3>
        <Link to={`/impact/${changeRequestId}`} className="text-xs text-brand-500 hover:underline">
          Full report →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className={`text-2xl font-bold ${RISK_STYLES[summary.riskLevel]}`}>
            {summary.blastRadius}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Blast Radius</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-200">{summary.riskScore}</p>
          <p className="text-xs text-gray-500 mt-0.5">Risk Score</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-200">{summary.affectedServices}</p>
          <p className="text-xs text-gray-500 mt-0.5">Services Affected</p>
        </div>
      </div>

      <div className={`text-center text-sm font-bold ${RISK_STYLES[summary.riskLevel]}`}>
        Risk Level: {summary.riskLevel}
      </div>

      {summary.explanation.length > 0 && (
        <ul className="space-y-1 pt-2 border-t border-white/10">
          {summary.explanation.slice(0, 3).map((e, i) => (
            <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
              <span className="text-brand-500 flex-shrink-0 mt-0.5">▸</span>
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
