import React, { useState, useEffect } from 'react';
import {
    Users,
    ShoppingBag,
    Briefcase,
    MessageSquare,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Stats {
    totalUsers: number;
    totalItems: number;
    totalJobs: number;
    totalPosts: number;
    newUsersThisWeek: number;
    newItemsThisWeek: number;
}

interface ActivityItem {
    id: number;
    title: string;
    type: 'user' | 'market' | 'job' | 'post';
    created_at: string;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data for the chart (In a real app, fetch this from API)
    const chartData = [
        { name: 'จ.', users: 4, items: 2 },
        { name: 'อ.', users: 3, items: 5 },
        { name: 'พ.', users: 2, items: 3 },
        { name: 'พฤ.', users: 7, items: 8 },
        { name: 'ศ.', users: 5, items: 4 },
        { name: 'ส.', users: 10, items: 12 },
        { name: 'อา.', users: 8, items: 7 },
    ];

    useEffect(() => {
        fetchStats();
        fetchActivity();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/recent-activity', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setActivities(data.data);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user': return <Users size={16} className="text-blue-600" />;
            case 'market': return <ShoppingBag size={16} className="text-green-600" />;
            case 'job': return <Briefcase size={16} className="text-purple-600" />;
            case 'post': return <MessageSquare size={16} className="text-orange-600" />;
            default: return <Activity size={16} className="text-gray-600" />;
        }
    };

    const getActivityText = (item: ActivityItem) => {
        switch (item.type) {
            case 'user': return `ผู้ใช้ใหม่: ${item.title}`;
            case 'market': return `สินค้าใหม่: ${item.title}`;
            case 'job': return `งานใหม่: ${item.title}`;
            case 'post': return `โพสต์ใหม่: ${item.title}`;
            default: return item.title;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'user': return 'bg-blue-100';
            case 'market': return 'bg-green-100';
            case 'job': return 'bg-purple-100';
            case 'post': return 'bg-orange-100';
            default: return 'bg-gray-100';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-blue"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'ผู้ใช้ทั้งหมด',
            value: stats?.totalUsers || 0,
            icon: <Users className="text-blue-600" size={24} />,
            bg: 'bg-blue-50',
            change: stats?.newUsersThisWeek || 0,
            trend: 'up'
        },
        {
            title: 'สินค้าในตลาด',
            value: stats?.totalItems || 0,
            icon: <ShoppingBag className="text-green-600" size={24} />,
            bg: 'bg-green-50',
            change: stats?.newItemsThisWeek || 0,
            trend: 'up'
        },
        {
            title: 'งานทั้งหมด',
            value: stats?.totalJobs || 0,
            icon: <Briefcase className="text-purple-600" size={24} />,
            bg: 'bg-purple-50',
            change: 0,
            trend: 'neutral'
        },
        {
            title: 'โพสต์ชุมชน',
            value: stats?.totalPosts || 0,
            icon: <MessageSquare className="text-orange-600" size={24} />,
            bg: 'bg-orange-50',
            change: 0,
            trend: 'neutral'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500">ภาพรวมสถิติและการใช้งานระบบ Phayao Hub</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                {card.icon}
                            </div>
                            {card.change > 0 && (
                                <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <TrendingUp size={14} />
                                    <span>+{card.change}</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{card.title}</h3>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{card.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Activity size={20} className="text-phayao-blue" />
                            สถิติการใช้งานรายสัปดาห์
                        </h2>
                    </div>
                    <div className="h-64 md:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    name="ผู้ใช้ใหม่"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="items"
                                    name="สินค้าใหม่"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorItems)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">กิจกรรมล่าสุด</h2>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">ไม่มีกิจกรรมล่าสุด</p>
                        ) : (
                            activities.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className={`w-8 h-8 rounded-full ${getActivityColor(item.type)} flex items-center justify-center flex-shrink-0`}>
                                        {getActivityIcon(item.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-slate-800 font-medium truncate" title={getActivityText(item)}>
                                            {getActivityText(item)}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                            <Clock size={10} />
                                            {new Date(item.created_at).toLocaleString('th-TH')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button className="w-full mt-6 py-2 text-sm text-phayao-blue font-medium hover:bg-blue-50 rounded-lg transition-colors">
                        ดูทั้งหมด
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
