import { prisma } from '../lib/prisma';
import { Prisma, Dependency } from '@prisma/client';

export class DependencyRepository {
  async create(data: Prisma.DependencyCreateInput): Promise<Dependency> {
    return prisma.dependency.create({ data });
  }

  async findAll(): Promise<Dependency[]> {
    return prisma.dependency.findMany();
  }

  async findBySource(sourceServiceId: string): Promise<Dependency[]> {
    return prisma.dependency.findMany({ where: { sourceServiceId } });
  }

  async findByTarget(targetServiceId: string): Promise<Dependency[]> {
    return prisma.dependency.findMany({ where: { targetServiceId } });
  }

  async delete(id: string): Promise<Dependency> {
    return prisma.dependency.delete({ where: { id } });
  }
}
