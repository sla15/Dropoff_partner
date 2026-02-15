
import { Order, Product, Review, RideRequest, Transaction, UserProfile } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];
export const DUMMY_ORDERS: Order[] = [];
export const RIDE_REQUESTS: RideRequest[] = [];
export const TRANSACTIONS: Transaction[] = [];
export const REVIEWS: Review[] = [];

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  phone: '',
  email: '',
  rating: 5.0,
  commissionDebt: 0,
  walletBalance: 0,
  isOnline: false,
  vehicle: undefined,
  business: undefined,
  documents: {
    license: { url: '', status: 'MISSING' },
    idCard: { url: '', status: 'MISSING' },
    insurance: { url: '', status: 'MISSING' },
  },
  isSuspended: false,
};
