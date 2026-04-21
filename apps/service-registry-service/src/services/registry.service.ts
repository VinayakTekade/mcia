import { RegistryRepository } from '../repositories/registry.repository';
import { Prisma } from '@prisma/client';

export class RegistryService {
  private repo = new RegistryRepository();

  async createService(data: any, userId?: string) {
    const input: Prisma.MicroserviceCreateInput = {
      name: data.name,
      ownerTeam: data.ownerTeam,
      repositoryUrl: data.repositoryUrl,
      currentVersion: data.currentVersion,
      communicationType: data.communicationType,
      criticalityLevel: data.criticalityLevel,
      description: data.description,
      createdBy: userId,
      updatedBy: userId,
    };

    if (data.endpoints && data.endpoints.length > 0) {
      input.endpoints = {
        create: data.endpoints
      };
    }

    return this.repo.create(input);
  }

  async getServices(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    return this.repo.findAll(skip, limit, search);
  }

  async getServiceById(id: string) {
    const svc = await this.repo.findById(id);
    if (!svc) throw { status: 404, message: 'Service not found' };
    return svc;
  }

  async updateService(id: string, data: any, userId?: string) {
    // Only updating root fields for simplicity. Updating nested endpoints requires more complex logic.
    const updateData: Prisma.MicroserviceUpdateInput = {
      ...data,
      updatedBy: userId
    };
    // remove endpoints from direct update payload
    delete updateData.endpoints; 

    return this.repo.update(id, updateData);
  }

  async deleteService(id: string) {
    return this.repo.delete(id);
  }
}
