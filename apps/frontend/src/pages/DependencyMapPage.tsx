import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useGraphData, useFilteredGraph } from '../features/dependency-map/hooks';
import { buildFlowNodes, buildFlowEdges } from '../features/dependency-map/graphUtils';
import FilterPanel from '../features/dependency-map/FilterPanel';
import ServiceDrawer from '../features/dependency-map/ServiceDrawer';
import type { GraphFilters } from '../features/dependency-map/types';

const INITIAL_FILTERS: GraphFilters = {
  search: '',
  dependencyTypes: [],
  criticalOnly: false,
};

export default function DependencyMapPage() {
  const [filters, setFilters] = useState<GraphFilters>(INITIAL_FILTERS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: rawGraph, isLoading, isError } = useGraphData();
  const filteredGraph = useFilteredGraph(rawGraph, filters);

  const syncedNodes = useMemo(
    () => buildFlowNodes(filteredGraph.nodes, selectedNodeId, {}),
    [filteredGraph.nodes, selectedNodeId]
  );
  const syncedEdges = useMemo(
    () => buildFlowEdges(filteredGraph.edges),
    [filteredGraph.edges]
  );

  const [, , onNodesChange] = useNodesState([]);
  const [, , onEdgesChange] = useEdgesState([]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(prev => (prev === node.id ? null : node.id));
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dependency Map</h1>
        <p className="text-gray-500 text-sm mt-1">
          {rawGraph
            ? `${rawGraph.nodes.length} services · ${rawGraph.edges.length} dependencies`
            : 'Loading graph...'}
          {rawGraph && filteredGraph.nodes.length !== rawGraph.nodes.length && (
            <span className="text-brand-500 ml-2">
              · showing {filteredGraph.nodes.length} / {rawGraph.nodes.length}
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Filter Panel */}
        <div className="w-64 flex-shrink-0 space-y-3">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            nodeCount={filteredGraph.nodes.length}
            edgeCount={filteredGraph.edges.length}
          />

          {/* Legend */}
          <div className="bg-surface-800 border border-surface-600 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Legend</p>
            <div className="space-y-2 text-xs">
              {[
                { color: 'bg-blue-500', label: 'REST' },
                { color: 'bg-purple-500', label: 'gRPC' },
                { color: 'bg-yellow-500', label: 'Event-Driven' },
                { color: 'bg-green-500', label: 'Queue-Based' },
                { color: 'bg-red-500', label: 'Critical path (animated)' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-6 h-0.5 ${color} flex-shrink-0`} />
                  <span className="text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Graph Canvas */}
        <div className="flex-1 relative bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-surface-800">
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm mt-3">Building dependency graph...</p>
            </div>
          )}

          {isError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <p className="text-red-400 font-medium">Failed to load graph</p>
              <p className="text-gray-600 text-sm mt-1">Check that dependency-mapping-service is running</p>
            </div>
          )}

          {!isLoading && !isError && filteredGraph.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <p className="text-gray-400 font-medium">No services match your filters</p>
              <button
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="text-sm text-brand-500 hover:underline mt-2"
              >
                Clear filters
              </button>
            </div>
          )}

          {!isLoading && !isError && filteredGraph.nodes.length > 0 && (
            <ReactFlow
              nodes={syncedNodes}
              edges={syncedEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#2d3650" gap={24} size={1} />
              <Controls
                style={{
                  background: '#1e2536',
                  border: '1px solid #2d3650',
                  borderRadius: '8px',
                }}
              />
              <MiniMap
                style={{ background: '#161b27', border: '1px solid #2d3650' }}
                nodeColor={(n) => (n.id === selectedNodeId ? '#4f6ef7' : '#252d40')}
                maskColor="rgba(15,17,23,0.7)"
              />
            </ReactFlow>
          )}

          {/* Service Detail Drawer */}
          <ServiceDrawer
            serviceId={selectedNodeId}
            onClose={() => setSelectedNodeId(null)}
          />
        </div>
      </div>
    </div>
  );
}
