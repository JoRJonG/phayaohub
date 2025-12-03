import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, FileText, ExternalLink, User } from 'lucide-react';
import Swal from 'sweetalert2';

interface JobSeeker {
    id: number;
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    experience: string;
    education: string;
    skills: string;
    resume_url: string;
    view_count: number;
    created_at: string;
    username?: string;
    user_email?: string;
    avatar_url?: string;
}

const JobSeekers: React.FC = () => {
    const [seekers, setSeekers] = useState<JobSeeker[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchSeekers();
    }, [page, search]);

    const fetchSeekers = async () => {
        try {
            const token = localStorage.getItem('token');
            const offset = (page - 1) * 50;
            const res = await fetch(`/api/admin/job-seekers?limit=50&offset=${offset}&search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSeekers(data.data);
                setTotalPages(Math.ceil(data.total / 50));
            }
        } catch (error) {
            console.error('Error fetching job seekers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: "การลบข้อมูลจะไม่สามารถกู้คืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/admin/job-seekers/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบแล้ว', 'success');
                    fetchSeekers();
                } else {
                    Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการคนหางาน</h1>
                    <p className="text-slate-500">จัดการข้อมูลผู้ฝากประวัติงานทั้งหมด</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                                <th className="p-4 font-medium">ชื่อ-นามสกุล</th>
                                <th className="p-4 font-medium">ข้อมูลติดต่อ</th>
                                <th className="p-4 font-medium">ทักษะเด่น</th>
                                <th className="p-4 font-medium">วันที่ฝาก</th>
                                <th className="p-4 font-medium">ยอดเข้าชม</th>
                                <th className="p-4 font-medium text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : seekers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">ไม่พบข้อมูล</td>
                                </tr>
                            ) : (
                                seekers.map((seeker) => (
                                    <tr key={seeker.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {seeker.avatar_url ? (
                                                    <img
                                                        src={seeker.avatar_url}
                                                        alt={seeker.full_name}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {seeker.full_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-slate-800">{seeker.full_name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <User size={10} />
                                                        {seeker.user_email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-600">{seeker.email}</div>
                                            <div className="text-sm text-slate-500">{seeker.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-600 max-w-xs truncate" title={seeker.skills}>
                                                {seeker.skills || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(seeker.created_at).toLocaleDateString('th-TH')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                                <Eye size={14} />
                                                {seeker.view_count}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {seeker.resume_url && (
                                                    <a
                                                        href={seeker.resume_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="ดูเรซูเม่"
                                                    >
                                                        <FileText size={18} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(seeker.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${page === p
                                    ? 'bg-phayao-blue text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobSeekers;
