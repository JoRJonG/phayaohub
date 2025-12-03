import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Briefcase,
    MapPin,
    Building
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

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
    category_id: number;
    status: string;
    category_name: string;
    created_at: string;
}

const MyJobs: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editJob, setEditJob] = useState<Job | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company_name: '',
        description: '',
        job_type: 'full_time',
        salary_min: '',
        salary_max: '',
        location: '',
        contact_email: '',
        contact_phone: '',
        contact_line: '',
        category_id: ''
    });
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchJobs();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/categories?type=job', {
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
            // Note: We need a new endpoint to fetch ONLY user's jobs, or filter on client side if API returns all (not ideal for security/performance but okay for MVP)
            // For now, let's assume we can filter the existing admin API or create a new one. 
            // Better approach: Create a specific endpoint for user's items.
            // Using existing admin API for now but filtering by user_id in frontend (Temporary)
            // Ideally: GET /api/user/jobs

            // Let's use the public API and filter by user_id if possible, or use the admin one if user has permission (they don't).
            // We need to create a new endpoint in backend for users to get their own items.
            // For this task, I will mock the fetch or reuse the admin one if I can modify backend.
            // I will modify backend to allow users to fetch their own items.

            // Assuming I will add /api/user/jobs endpoint.
            const response = await fetch('/api/user/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                // Fallback if endpoint doesn't exist yet
                setJobs([]);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setJobs(data.data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (job: Job) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/user/jobs/${job.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                const fullJob = data.data;
                setEditJob(fullJob);
                setFormData({
                    title: fullJob.title,
                    company_name: fullJob.company_name,
                    description: fullJob.description || '',
                    job_type: fullJob.job_type,
                    salary_min: fullJob.salary_min?.toString() || '',
                    salary_max: fullJob.salary_max?.toString() || '',
                    location: fullJob.location,
                    contact_email: fullJob.contact_email || '',
                    contact_phone: fullJob.contact_phone || '',
                    contact_line: fullJob.contact_line || '',
                    category_id: fullJob.category_id?.toString() || categories[0]?.id.toString() || ''
                });
                setShowCreateModal(true);
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลงานได้', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            company_name: '',
            description: '',
            job_type: 'full_time',
            salary_min: '',
            salary_max: '',
            location: '',
            contact_email: '',
            contact_phone: '',
            contact_line: '',
            category_id: categories[0]?.id.toString() || ''
        });
        setEditJob(null);
    };



    const handleStatusChange = async (jobId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/user/jobs/${jobId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                const statusText = newStatus === 'open' ? 'เปิดรับ' : 'ปิดรับ';
                Swal.fire({
                    icon: 'success',
                    title: 'อัพเดทสถานะสำเร็จ',
                    text: `เปลี่ยนสถานะเป็น ${statusText} แล้ว`,
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchJobs();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัพเดทสถานะ', 'error');
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
                const response = await fetch(`/api/user/jobs/${jobId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'ประกาศงานถูกลบแล้ว', 'success');
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
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const url = editJob ? `/api/user/jobs/${editJob.id}` : '/api/user/jobs';
            const method = editJob ? 'PUT' : 'POST';

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
                Swal.fire('สำเร็จ', editJob ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'สร้างประกาศงานใหม่เรียบร้อยแล้ว', 'success');
                setShowCreateModal(false);
                resetForm();
                fetchJobs();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            console.error('Create/Update job error:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">งานที่ลงประกาศ</h1>
                    <p className="text-slate-500">จัดการประกาศงานของคุณ</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>ลงประกาศงาน</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Briefcase size={48} className="text-slate-300 mb-4" />
                        <p>คุณยังไม่มีประกาศงาน</p>
                        <button onClick={() => setShowCreateModal(true)} className="mt-4 text-phayao-blue hover:underline">
                            เริ่มลงประกาศงานแรกของคุณ
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {jobs.map((job) => (
                            <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-lg">{job.title}</h3>
                                        <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Building size={14} /> {job.company_name}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{job.job_type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-center">
                                    <select
                                        value={job.status}
                                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer appearance-none ${job.status === 'open' ? 'bg-green-100 text-green-700' :
                                            job.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        <option value="open">เปิดรับ</option>
                                        <option value="closed">ปิดรับ</option>
                                    </select>
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
                                        title="ลบ"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">{editJob ? 'แก้ไขประกาศงาน' : 'ลงประกาศงานใหม่'}</h2>
                            <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
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
                                            <option value="full_time">เต็มเวลา</option>
                                            <option value="part_time">พาร์ทไทม์</option>
                                            <option value="freelance">ฟรีแลนซ์/สัญญาจ้าง</option>
                                            <option value="internship">ฝึกงาน</option>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">อีเมลติดต่อ</label>
                                        <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                        <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Line ID</label>
                                    <input type="text" value={formData.contact_line} onChange={(e) => setFormData({ ...formData, contact_line: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">ยกเลิก</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-800 transition font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting ? 'กำลังบันทึก...' : (editJob ? 'บันทึกการแก้ไข' : 'บันทึก')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyJobs;
