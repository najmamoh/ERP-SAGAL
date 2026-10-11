/**
 * Application Service: Vendor
 * Contains business logic for vendor operations
 */
import { IVendorRepository } from '../../domain/repositories/IVendorRepository';
import { Vendor, CreateVendorDTO, UpdateVendorDTO } from '../../domain/entities/Vendor';

export class VendorService {
  constructor(private repository: IVendorRepository) {}

  async getAllVendors(page: number = 1, pageSize: number = 20) {
    return await this.repository.getAll({ page, pageSize });
  }

  async getVendorById(id: number): Promise<Vendor> {
    return await this.repository.getById(id);
  }

  async createVendors(vendors: CreateVendorDTO[]): Promise<void> {
    if (vendors.length === 0) {
      throw new Error('At least one vendor is required');
    }
    
    vendors.forEach((vendor) => {
      if (!vendor.vendor_name || !vendor.vendor_email) {
        throw new Error('Vendor name and email are required');
      }
    });

    await this.repository.create(vendors);
  }

  async updateVendor(vendor: UpdateVendorDTO): Promise<void> {
    if (!vendor.vendor_id) {
      throw new Error('Vendor ID is required for update');
    }
    await this.repository.update(vendor);
  }

  async deleteVendor(id: number): Promise<void> {
    if (!id) {
      throw new Error('Vendor ID is required for deletion');
    }
    await this.repository.delete(id);
  }
}
