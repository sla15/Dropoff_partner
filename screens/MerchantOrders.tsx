import React, { useState } from 'react';
import { Clock, CheckCircle, Package, MessageSquare, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActionButton } from '../components/ActionButton';
import { Order, OrderStatus } from '../types';

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const styles = {
        INCOMING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        PREPARING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        READY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${styles[status]}`}>
            {status}
        </span>
    );
};

export const MerchantOrders: React.FC = () => {
    const { merchantOrders, updateOrderStatus, openChat, pushNotification, createDeliveryRequest } = useApp();
    const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const success = await updateOrderStatus(orderId, newStatus);
        if (success) {
            pushNotification('Order Updated', `Order #${orderId.slice(0, 8)} marked as ${newStatus}`, 'ORDER');

            // AUTOMATIC DELIVERY DISPATCH
            if (newStatus === 'READY') {
                const deliverySuccess = await createDeliveryRequest(orderId);
                if (deliverySuccess) {
                    pushNotification('Delivery Search', 'Searching for nearby drivers...', 'SYSTEM');
                }
            }
        }
    };

    const handleRejectOrder = (orderId: string) => {
        // In a real app, this would be an updateOrderStatus(orderId, 'CANCELLED')
        // For now we'll just not show it in the UI if rejected or similar
        alert('Order rejection logic would update DB status to CANCELLED');
    };

    const toggleItemCheck = (orderId: string, itemIndex: number) => {
        // Local UI only for the merchant check-off list
    };

    const filteredOrders = filter === 'ALL' ? merchantOrders : merchantOrders.filter(o => o.status === filter);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
            {/* Fixed Header */}
            <div className="px-6 pt-14 pb-4 shrink-0 bg-gray-50 dark:bg-black z-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Orders</h1>

                {/* Filter Pills */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {['ALL', 'INCOMING', 'PENDING', 'PREPARING', 'READY'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s as any)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${filter === s
                                ? 'bg-black dark:bg-white text-white dark:text-black'
                                : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            {s === 'ALL' ? 'All Orders' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 pt-2 space-y-4 no-scrollbar">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Package size={48} className="mb-2 opacity-50" />
                        <p>No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 transition-transform active:scale-[0.99]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{order.customerName}</h3>
                                    <p className="text-xs text-gray-500">#{order.id} • {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>

                            <div className="space-y-3 mb-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx}
                                        onClick={() => order.status !== 'INCOMING' && toggleItemCheck(order.id, idx)}
                                        className={`flex items-center justify-between group ${order.status !== 'INCOMING' ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden`}>
                                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    <span className="font-bold mr-1">{item.quantity}x</span>
                                                    {item.product.name}
                                                </span>
                                                <span className="text-xs text-gray-500">D{item.product.price} / item</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">D{item.product.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">D{order.total}</p>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <a
                                            href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-200"
                                        >
                                            <MessageSquare size={18} />
                                        </a>
                                        <a
                                            href={`tel:${order.customerPhone}`}
                                            className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200"
                                        >
                                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.9.1.91 2.5 0 011.0.8l1.45 2.5a2 2 0 01-.4 2.1l-2.0 1.25a2 2 0 00-.8 2.2c.4 1.1 1.2 2 2.2 2.4a2 2 0 002.2-.8l1.25-2.0a2 2 0 012.1-.4l2.5 1.45a1.9 1.9 0 01.8 1.0c.3.7.2 1.5-.1 1.9a2 2 0 01-1.9.1l-2.28-.1a2 2 0 01-2-2C11 18 3 10 3 5z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {order.status === 'INCOMING' && (
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleRejectOrder(order.id)} className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-200">
                                        <X size={20} />
                                    </button>
                                    <button onClick={() => handleStatusChange(order.id, 'PENDING')} className="px-4 bg-partner-green text-black font-bold rounded-xl hover:bg-green-400 flex items-center gap-2">
                                        <Check size={18} /> Accept
                                    </button>
                                </div>
                            )}

                            {order.status === 'PENDING' && (
                                <ActionButton size="sm" onClick={() => handleStatusChange(order.id, 'PREPARING')}>
                                    Start Preparing
                                </ActionButton>
                            )}
                            {order.status === 'PREPARING' && (
                                <ActionButton size="sm" onClick={() => handleStatusChange(order.id, 'READY')} className="bg-partner-darkGreen text-white">
                                    Mark Ready
                                </ActionButton>
                            )}
                            {order.status === 'READY' && (
                                <div className="text-sm text-gray-500 italic">Waiting for pickup...</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};