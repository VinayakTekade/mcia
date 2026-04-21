import { prisma } from '../lib/prisma';
import { Prisma, Microservice } from '@prisma/client';

export class RegistryRepository {
  async create(data: Prisma.MicroserviceCreateInput): Promise<Microservice> {
    return prisma.microservice.create({
      data,
      include: { endpoints: true }
    });
  }

  async findAll(skip?: number, take?: number, search?: string): Promise<{ data: Microservice[], total: number }> {
    const where: Prisma.MicroserviceWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { ownerTeam: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.microservice.findMany({
        where,
        skip,
        take,
        include: { endpoints: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.microservice.count({ where })
    ]);

    return { data, total };
  }

  async findById(idOrName: string): Promise<Microservice | null> {
    return prisma.microservice.findFirst({
      where: {
        OR: [
          { id: idOrName },
          { name: idOrName }
        ]
      },
      include: { endpoints: true }
    });
  }

  async update(id: string, data: Prisma.MicroserviceUpdateInput): Promise<Microservice> {
    return prisma.microservice.update({
      where: { id },
      data,
      include: { endpoints: true }
    });
  }

  async delete(id: string): Promise<Microservice> {
    return prisma.microservice.delete({ where: { id } });
  }
}
