import React, { useState, useEffect } from 'react';
import { usePreventRefresh } from '../../hooks/usePreventRefresh';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Briefcase,
    MapPin,
    Building,
    DollarSign,
    Filter,
    Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/admin/Pagination';

interface Job {
    id: number;
    title: string;
    company_name: string;
    description: string;
    job_type: string;
    salary_min: number;
    salary_max: number;
    location: string;
    contact_email?: string;
    contact_phone?: string;
    contact_line?: string;
    requirements?: string;
    benefits?: string;
    user_id: number;
    category_id: number;
    status: string;
    username: string;
    category_name: string;
    created_at: string;
}

const AdminJobs: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        company_name: '',
        description: '',
        job_type: 'full-time',
        salary_min: '',
        salary_max: '',
        location: '',
        contact_email: '',
        contact_phone: '',
        contact_line: '',
        requirements: '',
        benefits: '',
        user_id: '',
        category_id: '',
        status: 'open'
    });
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

    // Prevent accidental refresh when modal is open
    usePreventRefresh(showCreateModal);

    useEffect(() => {
        fetchJobs();
        fetchCategories();
    }, [filter, currentPage]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/categories?type=job', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                setCategories(data.data);
                setFormData(prev => ({ ...prev, category_id: data.data[0].id.toString() }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `/api/admin/jobs?page=${currentPage}&limit=20`;
            if (filter !== 'all') {
                url += `&status=${filter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setJobs(data.data);
                setTotalPages(Math.ceil((data.total || 0) / 20) || 1);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลงานได้', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (jobId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/jobs/${jobId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                Toast.fire({
                    icon: 'success',
                    title: 'อัพเดทสถานะเรียบร้อย'
                });
                fetchJobs();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDelete = async (jobId: number) => {
        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: "การลบประกาศงานจะไม่สามารถกู้คืนได้!",
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
                const response = await fetch(`/api/admin/jobs/${jobId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'ประกาศงานถูกลบออกจากระบบแล้ว', 'success');
                    fetchJobs();
                } else {
                    Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = isEditing ? `/api/admin/jobs/${editingId}` : '/api/admin/jobs';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                    salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                    category_id: formData.category_id ? parseInt(formData.category_id) : null
                })
            });
            const data = await response.json();
            if (data.success) {
                Swal.fire('สำเร็จ', isEditing ? 'แก้ไขข้อมูลเรียบร้อย' : 'สร้างประกาศงานใหม่เรียบร้อยแล้ว', 'success');
                setShowCreateModal(false);
                resetForm();
                fetchJobs();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleEdit = (job: Job) => {
        setIsEditing(true);
        setEditingId(job.id);
        setFormData({
            title: job.title,
            company_name: job.company_name,
            description: job.description || '',
            job_type: job.job_type,
            salary_min: job.salary_min?.toString() || '',
            salary_max: job.salary_max?.toString() || '',
            location: job.location,
            contact_email: job.contact_email || '',
            contact_phone: job.contact_phone || '',
            contact_line: job.contact_line || '',
            requirements: job.requirements || '',
            benefits: job.benefits || '',
            user_id: '',
            category_id: job.category_id?.toString() || categories[0]?.id.toString(),
            status: job.status
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            company_name: '',
            description: '',
            job_type: 'full-time',
            salary_min: '',
            salary_max: '',
            location: '',
            contact_email: '',
            contact_phone: '',
            contact_line: '',
            requirements: '',
            benefits: '',
            user_id: '',
            category_id: categories[0]?.id.toString() || '',
            status: 'open'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'เปิดรับ';
            case 'closed': return 'ปิดรับ';
            case 'inactive': return 'ไม่แสดง';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการงาน</h1>
                    <p className="text-slate-500">ตรวจสอบและจัดการประกาศหางาน</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>เพิ่มงาน</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <Filter size={20} className="text-slate-400 mr-2" />
                    {['all', 'open', 'closed', 'inactive'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === status
                                ? 'bg-phayao-blue text-white shadow-md shadow-blue-500/20'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {status === 'all' ? 'ทั้งหมด' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">ตำแหน่งงาน</th>
                                <th className="p-4 font-semibold">บริษัท</th>
                                <th className="p-4 font-semibold">สถานที่</th>
                                <th className="p-4 font-semibold">ผู้โพสต์</th>
                                <th className="p-4 font-semibold">สถานะ</th>
                                <th className="p-4 font-semibold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-phayao-blue"></div>
                                            กำลังโหลดข้อมูล...
                                        </div>
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">ไม่พบข้อมูลประกาศงาน</td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{job.title}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">{job.job_type}</span>
                                                        <span>{job.category_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Building size={14} className="text-slate-400" />
                                                {job.company_name}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin size={14} className="text-slate-400" />
                                                {job.location}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {job.username}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={job.status}
                                                onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${getStatusBadge(job.status)}`}
                                            >
                                                <option value="open">เปิดรับ</option>
                                                <option value="closed">ปิดรับ</option>
                                                <option value="inactive">ไม่แสดง</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(job)}
                                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                                                    title="ลบประกาศ"
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
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'แก้ไขประกาศงาน' : 'เพิ่มประกาศงานใหม่'}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleCreateJob} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ตำแหน่งงาน *</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">บริษัท *</label>
                                    <input type="text" required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" rows={3} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทงาน</label>
                                        <select value={formData.job_type} onChange={(e) => setFormData({ ...formData, job_type: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition">
                                            <option value="full-time">เต็มเวลา</option>
                                            <option value="part-time">พาร์ทไทม์</option>
                                            <option value="contract">สัญญาจ้าง</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ *</label>
                                        <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition">
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">เงินเดือนขั้นต่ำ</label>
                                        <input type="number" value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">เงินเดือนสูงสุด</label>
                                        <input type="number" value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่ *</label>
                                    <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">คุณสมบัติผู้สมัคร</label>
                                    <textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">สวัสดิการ</label>
                                    <textarea value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" rows={3} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">อีเมลติดต่อ</label>
                                        <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                        <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Line ID</label>
                                        <input type="text" value={formData.contact_line} onChange={(e) => setFormData({ ...formData, contact_line: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                </div>
                                {isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition">
                                            <option value="open">เปิดรับ</option>
                                            <option value="closed">ปิดรับ</option>
                                            <option value="inactive">ไม่แสดง</option>
                                        </select>
                                    </div>
                                )}
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">ยกเลิก</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-800 transition font-medium shadow-lg shadow-blue-900/20">บันทึก</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobs;
