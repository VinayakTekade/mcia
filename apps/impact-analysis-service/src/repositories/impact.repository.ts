import { prisma } from '../lib/prisma';
import { Prisma, ImpactReport } from '@prisma/client';

export class ImpactRepository {
  async saveReport(data: Prisma.ImpactReportCreateInput): Promise<ImpactReport> {
    return prisma.impactReport.upsert({
      where: { changeRequestId: data.changeRequestId },
      update: data,
      create: data,
    });
  }

  async getReport(changeRequestId: string): Promise<ImpactReport | null> {
    return prisma.impactReport.findUnique({ where: { changeRequestId } });
  }

  async getAllReports(): Promise<ImpactReport[]> {
    return prisma.impactReport.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
