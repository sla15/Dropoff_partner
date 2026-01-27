import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Order, Product, Transaction, Review, RideRequest, RideStatus, OrderStatus } from '../types';
import { DUMMY_ORDERS, TRANSACTIONS, REVIEWS } from '../data/dummyData';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DomainContextType {
    orders: Order[];
    setOrders: (orders: Order[]) => void;
    products: Product[];
    loadProducts: (businessId: string) => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>, businessId: string) => Promise<boolean>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    transactions: Transaction[];
    reviews: Review[];
    merchantOrders: Order[];
    loadMerchantOrders: (businessId: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
    createDeliveryRequest: (orderId: string) => Promise<boolean>;
    currentRide: RideRequest | null;
    setCurrentRide: (ride: RideRequest | null) => void;
    rideStatus: RideStatus;
    setRideStatus: (status: RideStatus) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export const DomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [merchantOrders, setMerchantOrders] = useState<Order[]>([]);
    const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
    const [rideStatus, setRideStatus] = useState<RideStatus>('IDLE');

    const loadData = useCallback(async () => {
        if (!user) return;

        try {
            // 1. Fetch Completed Rides
            const { data: rides } = await supabase.from('rides')
                .select('*')
                .eq('driver_id', user.id)
                .eq('status', 'completed')
                .order('created_at', { ascending: false });

            // 2. Fetch Completed Orders (if merchant)
            let merchantOrders: any[] = [];
            const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle();
            if (business) {
                const { data: ordersData } = await supabase.from('orders')
                    .select('*')
                    .eq('business_id', business.id)
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false });
                merchantOrders = ordersData || [];
            }

            // 3. Map to Transactions
            const rideTx: Transaction[] = (rides || []).map(r => ({
                id: r.id,
                type: 'RIDE',
                amount: parseFloat(r.price),
                date: new Date(r.created_at).toLocaleDateString(),
                description: `Ride to ${r.dropoff_address.split(',')[0]}`,
                status: 'completed',
                commission: parseFloat(r.price) * 0.2 // Assuming 20%
            }));

            const orderTx: Transaction[] = merchantOrders.map(o => ({
                id: o.id,
                type: 'ORDER',
                amount: parseFloat(o.total_amount),
                date: new Date(o.created_at).toLocaleDateString(),
                description: `Order #${o.id.slice(0, 8)}`,
                status: 'completed',
                commission: parseFloat(o.total_amount) * 0.15 // Assuming 15%
            }));

            setTransactions([...rideTx, ...orderTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            // 4. Fetch Reviews
            const { data: reviewsData } = await supabase.from('reviews')
                .select('*')
                .eq('target_id', user.id)
                .order('created_at', { ascending: false });

            // Fetch reviewer names manually (simpler than complex join for now without type gen)
            const mappedReviews: Review[] = [];
            if (reviewsData) {
                for (const r of reviewsData) {
                    const { data: reviewer } = await supabase.from('profiles').select('full_name').eq('id', r.reviewer_id).single();
                    mappedReviews.push({
                        id: r.id,
                        reviewerName: reviewer?.full_name || 'Anonymous',
                        rating: r.rating,
                        comment: r.comment || '',
                        date: new Date(r.created_at).toLocaleDateString()
                    });
                }
            }
            setReviews(mappedReviews);

            if (business) {
                await loadMerchantOrders(business.id);
            }
        } catch (err) {
            console.error("Error loading domain data:", err);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const loadProducts = useCallback(async (businessId: string) => {
        try {
            const { data, error } = await supabase.from('products').select('*').eq('business_id', businessId);
            if (error) throw error;

            const mappedProducts: Product[] = data.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: parseFloat(p.price),
                image: p.image_url,
                category: p.category,
                stock: p.stock,
                isAvailable: p.is_available
            }));
            setProducts(mappedProducts);
        } catch (err) {
            console.error("Error loading products:", err);
        }
    }, []);

    const loadMerchantOrders = useCallback(async (businessId: string) => {
        try {
            const { data: ordersData, error } = await supabase
                .from('orders')
                .select('*, profiles(full_name, phone)')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const ordersWithItems: Order[] = [];
            for (const o of ordersData) {
                const { data: items } = await supabase
                    .from('order_items')
                    .select('*, products(*)')
                    .eq('order_id', o.id);

                ordersWithItems.push({
                    id: o.id,
                    customerName: (o.profiles as any)?.full_name || 'Customer',
                    customerPhone: (o.profiles as any)?.phone || '',
                    status: o.status as OrderStatus,
                    total: parseFloat(o.total_amount),
                    timestamp: new Date(o.created_at),
                    items: (items || []).map(i => ({
                        product: {
                            id: i.products.id,
                            name: i.products.name,
                            price: parseFloat(i.products.price),
                            image: i.products.image_url,
                            category: i.products.category
                        } as any,
                        quantity: i.quantity,
                        checked: false
                    }))
                });
            }
            setMerchantOrders(ordersWithItems);
        } catch (err) {
            console.error("Error loading merchant orders:", err);
        }
    }, []);

    const createDeliveryRequest = async (orderId: string) => {
        try {
            // 1. Fetch Order and Business Data
            const { data: order, error: orderErr } = await supabase
                .from('orders')
                .select('*, businesses(*), profiles(*)')
                .eq('id', orderId)
                .single();

            if (orderErr || !order) throw new Error("Order not found");

            const business = order.businesses;
            const customer = order.profiles;

            // 2. Fetch Settings for Fee
            const { data: settings } = await supabase.from('app_settings').select('*').limit(1).single();
            const minFee = parseFloat(settings?.min_delivery_fee || '2');

            // 3. Calculate distance (Simplified for now - can use a helper later)
            const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                const R = 6371;
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            };

            const distance = calculateDistance(
                business.lat, business.lng,
                order.dropoff_lat || business.lat, order.dropoff_lng || business.lng
            );

            // Fee logic: min_fee + (distance * per_km_rate) - Using min for now as requested
            const finalPrice = Math.max(minFee, distance * 5); // Example multiplier

            // 4. Create Ride Request in 'rides' table
            const { error: rideErr } = await supabase.from('rides').insert({
                customer_id: order.customer_id,
                pickup_lat: business.lat,
                pickup_lng: business.lng,
                pickup_address: business.location_address,
                dropoff_lat: order.dropoff_lat || business.lat,
                dropoff_lng: order.dropoff_lng || business.lng,
                dropoff_address: order.delivery_address || 'Customer Location',
                price: finalPrice,
                status: 'pending',
                type: 'DELIVERY',
                ride_type: 'DELIVERY'
            });

            if (rideErr) throw rideErr;
            return true;
        } catch (err) {
            console.error("Error creating delivery request:", err);
            return false;
        }
    };

    const addProduct = async (product: Omit<Product, 'id'>, businessId: string) => {
        try {
            const { error } = await supabase.from('products').insert({
                business_id: businessId,
                name: product.name,
                description: product.description,
                price: product.price,
                image_url: product.image,
                category: product.category,
                stock: product.stock,
                is_available: product.isAvailable
            });
            if (error) throw error;
            await loadProducts(businessId);
            return true;
        } catch (err) {
            console.error("Error adding product:", err);
            return false;
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const payload: any = {};
            if (updates.name !== undefined) payload.name = updates.name;
            if (updates.description !== undefined) payload.description = updates.description;
            if (updates.price !== undefined) payload.price = updates.price;
            if (updates.image !== undefined) payload.image_url = updates.image;
            if (updates.category !== undefined) payload.category = updates.category;
            if (updates.stock !== undefined) payload.stock = updates.stock;
            if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;

            const { error } = await supabase.from('products').update(payload).eq('id', id);
            if (error) throw error;

            // Re-load for the specific business (need to find business_id first or just reload global products)
            // For now, let's just refresh if we have a user/business context
            const { data } = await supabase.from('products').select('business_id').eq('id', id).single();
            if (data) await loadProducts(data.business_id);

            return true;
        } catch (err) {
            console.error("Error updating product:", err);
            return false;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { data } = await supabase.from('products').select('business_id').eq('id', id).single();
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            if (data) await loadProducts(data.business_id);
            return true;
        } catch (err) {
            console.error("Error deleting product:", err);
            return false;
        }
    };

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;

            // Reload for consistency
            const { data } = await supabase.from('orders').select('business_id').eq('id', orderId).single();
            if (data) await loadMerchantOrders(data.business_id);

            return true;
        } catch (err) {
            console.error("Error updating order status:", err);
            return false;
        }
    };

    return (
        <DomainContext.Provider value={{
            orders, setOrders, products, loadProducts, addProduct, updateProduct, deleteProduct,
            transactions, reviews, merchantOrders, loadMerchantOrders, updateOrderStatus,
            createDeliveryRequest, currentRide, setCurrentRide, rideStatus, setRideStatus
        }}>
            {children}
        </DomainContext.Provider>
    );
};

export const useDomain = () => {
    const context = useContext(DomainContext);
    if (context === undefined) throw new Error('useDomain must be used within a DomainProvider');
    return context;
};
