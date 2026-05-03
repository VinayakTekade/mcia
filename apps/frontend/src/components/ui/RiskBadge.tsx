interface Props {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const map = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

export default function RiskBadge({ riskLevel }: Props) {
  return <span className={map[riskLevel]}>{riskLevel}</span>;
}
