import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { impactApi } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RiskBadge from '../components/ui/RiskBadge';
import type { ImpactReport } from '../types';

export default function ImpactReportPage() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, isError } = useQuery<ImpactReport>({
    queryKey: ['impact', id],
    queryFn: () => impactApi.get(id!),
  });

  if (isLoading) return <LoadingSpinner message="Loading impact report..." />;
  if (isError || !report) return (
    <div className="card text-center py-12">
      <p className="text-gray-400 text-lg">No impact report found.</p>
      <p className="text-gray-600 text-sm mt-1">Submit the change request to trigger analysis.</p>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Impact Report</h1>
        <p className="text-gray-500 text-sm mt-1">CR: {report.changeRequestId}</p>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Blast Radius', value: report.blastRadius, color: 'text-orange-400' },
          { label: 'Risk Score', value: report.riskScore, color: 'text-red-400' },
          { label: 'Affected Services', value: report.affectedServices, color: 'text-yellow-400' },
          { label: 'Affected Contracts', value: report.affectedContracts, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Risk Level</p>
          <div className="mt-1"><RiskBadge riskLevel={report.riskLevel as any} /></div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">Change Type</p>
          <p className="text-gray-200 font-medium mt-1">{report.changeType.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 mb-3">Risk Factors</h2>
        <ul className="space-y-2">
          {(report.explanation as string[]).map((factor, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-brand-500 mt-0.5 flex-shrink-0">▸</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Direct Impacts ({report.directImpacts.length})</h2>
          {report.directImpacts.length === 0
            ? <p className="text-gray-600 text-sm">None</p>
            : <ul className="space-y-1">{report.directImpacts.map(s => (
              <li key={s} className="text-sm font-mono text-red-400 bg-red-900/20 px-2 py-1 rounded">{s}</li>
            ))}</ul>}
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Indirect Impacts ({report.indirectImpacts.length})</h2>
          {report.indirectImpacts.length === 0
            ? <p className="text-gray-600 text-sm">None</p>
            : <ul className="space-y-1">{report.indirectImpacts.map(s => (
              <li key={s} className="text-sm font-mono text-orange-400 bg-orange-900/20 px-2 py-1 rounded">{s}</li>
            ))}</ul>}
        </div>
      </div>
    </div>
  );
}
