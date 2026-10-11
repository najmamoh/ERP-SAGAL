/**
 * Presentation Hook: useVendorService
 * Provides easy access to VendorService in React components
 */
import { useMemo } from 'react';
import { VendorService } from '../../application/services/VendorService';
import { VendorRepository } from '../../infrastructure/api/VendorRepository';

export const useVendorService = () => {
  const vendorService = useMemo(() => {
    const repository = new VendorRepository();
    return new VendorService(repository);
  }, []);

  return vendorService;
};
