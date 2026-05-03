import type { Node, Edge } from 'reactflow';
import type { GraphNode, GraphEdge } from './types';

const DEP_TYPE_COLORS: Record<string, string> = {
  REST: '#4f6ef7',
  GRPC: '#a78bfa',
  EVENT_DRIVEN: '#f59e0b',
  QUEUE_BASED: '#10b981',
};

const CRITICALITY_BORDER: Record<string, string> = {
  LOW: '#2d3650',
  MEDIUM: '#ca8a04',
  HIGH: '#ea580c',
  CRITICAL: '#dc2626',
};

/**
 * Lay out nodes in a simple grid, then return React Flow Node objects.
 */
export function buildFlowNodes(
  nodes: GraphNode[],
  selectedId: string | null,
  serviceMetaMap: Record<string, { criticalityLevel?: string }>
): Node[] {
  const cols = Math.max(Math.ceil(Math.sqrt(nodes.length)), 1);

  return nodes.map((n, i) => {
    const meta = serviceMetaMap[n.id];
    const criticality = meta?.criticalityLevel || 'LOW';
    const isSelected = n.id === selectedId;

    return {
      id: n.id,
      position: {
        x: (i % cols) * 220,
        y: Math.floor(i / cols) * 130,
      },
      data: { label: n.id },
      style: {
        background: isSelected ? '#1e3a5f' : '#1e2536',
        border: `2px solid ${isSelected ? '#4f6ef7' : CRITICALITY_BORDER[criticality]}`,
        borderRadius: '10px',
        color: '#e2e8f0',
        fontSize: '12px',
        fontWeight: 500,
        padding: '10px 14px',
        minWidth: '140px',
        textAlign: 'center' as const,
        boxShadow: isSelected ? '0 0 0 3px rgba(79,110,247,0.3)' : 'none',
        transition: 'all 0.15s',
      },
    };
  });
}

/**
 * Convert graph edges to React Flow Edge objects with visual encoding.
 */
export function buildFlowEdges(edges: GraphEdge[]): Edge[] {
  return edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: e.isCritical === true,
    label: e.type,
    labelStyle: { fill: '#6b7280', fontSize: '10px', fontWeight: 400 },
    labelBgStyle: { fill: '#1e2536', opacity: 0.85 },
    style: {
      stroke: e.isCritical ? '#ef4444' : (DEP_TYPE_COLORS[e.type || 'REST'] || '#4f6ef7'),
      strokeWidth: e.isCritical ? 2 : 1.5,
    },
    markerEnd: { type: 'arrowclosed' as any, color: e.isCritical ? '#ef4444' : '#4f6ef7' },
  }));
}
