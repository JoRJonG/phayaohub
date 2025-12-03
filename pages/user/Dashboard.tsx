import React from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingBag,
    Briefcase,
    MessageSquare,
    Plus,
    ArrowRight,
    Settings,
    FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserActivities } from '../../services/api';

const UserDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activities, setActivities] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const [statsData, setStatsData] = React.useState({
        marketItems: 0,
        jobs: 0,
        posts: 0,
        hasProfile: false
    });

    React.useEffect(() => {
        fetchActivities();
        fetchStats();
    }, []);

    const fetchActivities = async () => {
        try {
            const data = await getUserActivities();
            if (data.success) {
                setActivities(data.data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Fetch Market Items Count
            const marketRes = await fetch('/api/user/market-items', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const marketData = await marketRes.json();

            // Fetch Jobs Count
            const jobsRes = await fetch('/api/user/jobs', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const jobsData = await jobsRes.json();

            // Fetch Posts Count
            const postsRes = await fetch('/api/user/posts', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const postsData = await postsRes.json();

            // Check Job Profile
            const profileRes = await fetch('/api/job-profiles/me', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const profileData = await profileRes.json();

            setStatsData({
                marketItems: marketData.data ? marketData.data.length : 0,
                jobs: jobsData.data ? jobsData.data.length : 0,
                posts: postsData.data ? postsData.data.length : 0,
                hasProfile: !!profileData.data
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'market': return <ShoppingBag size={18} className="text-green-600" />;
            case 'job': return <Briefcase size={18} className="text-purple-600" />;
            case 'post': return <MessageSquare size={18} className="text-orange-600" />;
            default: return <Settings size={18} className="text-slate-600" />;
        }
    };

    const getActivityLink = (type: string, id: number) => {
        switch (type) {
            case 'market': return `/market/${id}`;
            case 'job': return `/jobs/${id}`;
            case 'post': return `/community/${id}`;
            default: return '#';
        }
    };

    const getActivityLabel = (type: string) => {
        switch (type) {
            case 'market': return 'ลงขายสินค้า';
            case 'job': return 'ประกาศงาน';
            case 'post': return 'ตั้งกระทู้';
            default: return 'กิจกรรม';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const stats = [
        {
            title: 'สินค้าของฉัน',
            value: statsData.marketItems,
            icon: <ShoppingBag className="text-green-600" size={24} />,
            bg: 'bg-green-50',
            link: '/user/market-items',
            action: 'ลงขายสินค้า'
        },
        {
            title: 'งานที่ลงประกาศ',
            value: statsData.jobs,
            icon: <Briefcase className="text-purple-600" size={24} />,
            bg: 'bg-purple-50',
            link: '/user/jobs',
            action: 'ลงประกาศงาน'
        },
        {
            title: 'โพสต์ของฉัน',
            value: statsData.posts,
            icon: <MessageSquare className="text-orange-600" size={24} />,
            bg: 'bg-orange-50',
            link: '/user/posts',
            action: 'ตั้งกระทู้'
        },
        {
            title: 'ฝากประวัติงาน',
            value: statsData.hasProfile ? 1 : 0,
            icon: <FileText className="text-blue-600" size={24} />,
            bg: 'bg-blue-50',
            link: '/user/deposit-resume',
            action: statsData.hasProfile ? 'แก้ไขประวัติ' : 'ฝากประวัติ'
        },
        {
            title: 'ตั้งค่าบัญชี',
            value: '-',
            icon: <Settings className="text-slate-600" size={24} />,
            bg: 'bg-slate-100',
            link: '/user/profile',
            action: 'แก้ไขข้อมูล'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-phayao-blue to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">สวัสดี, {user?.full_name || user?.username}! 👋</h1>
                    <p className="text-blue-100 max-w-xl">
                        ยินดีต้อนรับสู่หน้าจัดการส่วนตัวของคุณ ที่นี่คุณสามารถจัดการสินค้า ประกาศงาน และโพสต์ต่างๆ ของคุณได้อย่างง่ายดาย
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
                <div className="absolute right-20 bottom-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                {stat.icon}
                            </div>
                            <Link
                                to={stat.link}
                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-phayao-blue group-hover:text-white transition-colors"
                            >
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <Link
                                to={stat.link}
                                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-phayao-blue text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                            >
                                <Plus size={16} />
                                {stat.action}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">กิจกรรมล่าสุด</h2>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400">กำลังโหลด...</div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageSquare size={24} />
                            </div>
                            <p>ยังไม่มีกิจกรรมล่าสุด</p>
                        </div>
                    ) : (
                        activities.map((activity, index) => (
                            <Link
                                key={`${activity.type}-${activity.id}`}
                                to={getActivityLink(activity.type, activity.id)}
                                className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'market' ? 'bg-green-50' :
                                        activity.type === 'job' ? 'bg-purple-50' : 'bg-orange-50'
                                        }`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800 group-hover:text-phayao-blue transition">{activity.title}</h4>
                                        <p className="text-xs text-slate-500">{getActivityLabel(activity.type)} • {formatDate(activity.created_at)}</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-phayao-blue transition" />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
