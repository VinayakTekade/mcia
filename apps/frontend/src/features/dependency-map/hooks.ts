import { useQuery } from '@tanstack/react-query';
import { dependenciesApi, servicesApi } from '../../api/client';
import type { GraphData, ServiceDetail, GraphFilters } from './types';

export function useGraphData() {
  return useQuery<GraphData>({
    queryKey: ['dependency-graph'],
    queryFn: dependenciesApi.graph,
    staleTime: 60_000,
  });
}

export function useServiceDetail(serviceId: string | null) {
  return useQuery<ServiceDetail>({
    queryKey: ['service-detail', serviceId],
    queryFn: () => servicesApi.get(serviceId!),
    enabled: !!serviceId,
    staleTime: 30_000,
  });
}

export function useFilteredGraph(graph: GraphData | undefined, filters: GraphFilters) {
  if (!graph) return { nodes: [], edges: [] };

  const { search, dependencyTypes, criticalOnly } = filters;
  const searchLower = search.toLowerCase();

  // Filter nodes by search term
  const matchedNodeIds = new Set(
    graph.nodes
      .filter(n => !searchLower || n.id.toLowerCase().includes(searchLower))
      .map(n => n.id)
  );

  // Filter edges by type and criticality, keeping only edges whose
  // both endpoints exist in the matched nodes set.
  const filteredEdges = graph.edges.filter(e => {
    if (!matchedNodeIds.has(e.source) && !matchedNodeIds.has(e.target)) return false;
    if (dependencyTypes.length > 0 && e.type && !dependencyTypes.includes(e.type)) return false;
    if (criticalOnly && !e.isCritical) return false;
    return true;
  });

  // Expand matched nodes to include nodes connected via filtered edges
  const visibleNodeIds = new Set<string>();
  filteredEdges.forEach(e => {
    visibleNodeIds.add(e.source);
    visibleNodeIds.add(e.target);
  });
  matchedNodeIds.forEach(id => visibleNodeIds.add(id));

  const filteredNodes = graph.nodes.filter(n => visibleNodeIds.has(n.id));

  return { nodes: filteredNodes, edges: filteredEdges };
}
