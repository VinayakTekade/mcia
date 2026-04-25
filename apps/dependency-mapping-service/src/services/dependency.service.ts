import { DependencyRepository } from '../repositories/dependency.repository';
import { Prisma } from '@prisma/client';

export class DependencyService {
  private repo = new DependencyRepository();

  async createDependency(data: Prisma.DependencyCreateInput) {
    // Basic catch for upsert-like behavior if they exist
    try {
      return await this.repo.create(data);
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw { status: 409, message: 'Dependency already exists between these services' };
      }
      throw err;
    }
  }

  async getAllDependencies() {
    return this.repo.findAll();
  }

  async getUpstream(serviceId: string) {
    // Upstream means services calling this service
    return this.repo.findByTarget(serviceId);
  }

  async getDownstream(serviceId: string) {
    // Downstream means services this service calls
    return this.repo.findBySource(serviceId);
  }

  async getGraph() {
    const deps = await this.repo.findAll();
    const nodes = new Set<string>();
    
    const edges = deps.map(d => {
      nodes.add(d.sourceServiceId);
      nodes.add(d.targetServiceId);
      return {
        id: d.id,
        source: d.sourceServiceId,
        target: d.targetServiceId,
        type: d.dependencyType,
        isCritical: d.isCritical
      };
    });

    return {
      nodes: Array.from(nodes).map(id => ({ id })),
      edges
    };
  }

  async deleteDependency(id: string) {
    return this.repo.delete(id);
  }
}
