import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    ShoppingBag,
    Briefcase,
    MessageSquare,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Server,
    HardDrive,
    Cpu
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
    chartData?: { name: string; users: number; items: number; jobs: number; posts: number; seekers: number }[];
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
    const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats(chartPeriod);
    }, [chartPeriod]);

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchStats = async (period: string = 'weekly') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/stats?period=${period}`, {
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

    const handleActivityClick = (item: ActivityItem) => {
        switch (item.type) {
            case 'market':
                navigate(`/market/${item.id}`);
                break;
            case 'job':
                navigate(`/jobs/${item.id}`);
                break;
            case 'post':
                navigate(`/community/${item.id}`);
                break;
            case 'user':
                navigate(`/admin/users`);
                break;
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
                    <div key={index} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-minimal-hover transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                {card.icon}
                            </div>
                            {card.change > 0 && (
                                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
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
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Activity size={20} className="text-phayao-blue" />
                            สถิติการใช้งาน{chartPeriod === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}
                        </h2>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setChartPeriod('weekly')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${chartPeriod === 'weekly' ? 'bg-white text-phayao-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                7 วันล่าสุด
                            </button>
                            <button 
                                onClick={() => setChartPeriod('monthly')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${chartPeriod === 'monthly' ? 'bg-white text-phayao-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                6 เดือนย้อนหลัง
                            </button>
                        </div>
                    </div>
                    <div className="h-64 md:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={stats?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSeekers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="users" name="ผู้ใช้ใหม่" stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="items" name="สินค้าใหม่" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorItems)" />
                                <Area type="monotone" dataKey="jobs" name="งานใหม่" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" />
                                <Area type="monotone" dataKey="posts" name="โพสต์ใหม่" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPosts)" />
                                <Area type="monotone" dataKey="seekers" name="คนหางานใหม่" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorSeekers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Side Stack */}
                <div className="space-y-6">
                    {/* Recent Activity / Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">กิจกรรมล่าสุด</h2>
                    <div className="space-y-2">
                        {activities.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">ไม่มีกิจกรรมล่าสุด</p>
                        ) : (
                            activities.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleActivityClick(item)}
                                    className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors"
                                >
                                    <div className={`w-9 h-9 rounded-full ${getActivityColor(item.type)} flex items-center justify-center flex-shrink-0`}>
                                        {getActivityIcon(item.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-slate-800 font-bold truncate" title={getActivityText(item)}>
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

                    <button className="w-full mt-6 py-2.5 text-sm text-phayao-blue bg-blue-50 font-semibold hover:bg-blue-100 rounded-xl transition-colors">
                        ดูทั้งหมด
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
