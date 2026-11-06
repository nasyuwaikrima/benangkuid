import { Order, Customer, CustomerMeasurement } from '@/types/database';

export interface CustomerWithMeasurements extends Customer {
  customer_measurements?: CustomerMeasurement[];
}

export interface OrderWithCustomer extends Order {
  customers: CustomerWithMeasurements | null;
}
