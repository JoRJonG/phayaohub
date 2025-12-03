import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    MoreVertical,
    Shield,
    User as UserIcon,
    Phone,
    Mail,
    Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/admin/Pagination';

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    status: 'active' | 'suspended';
    created_at: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'user'
    });

    // Edit User State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState({
        full_name: '',
        phone: '',
        status: 'active'
    });

    // Reset Password State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [search, currentPage]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `/api/admin/users?page=${currentPage}&limit=20`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
                setTotalPages(Math.ceil((data.total || 0) / 20) || 1);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
                confirmButtonColor: '#1e3a8a'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'สร้างผู้ใช้ใหม่เรียบร้อยแล้ว',
                    confirmButtonColor: '#1e3a8a'
                });
                setShowCreateModal(false);
                setFormData({ username: '', email: '', password: '', full_name: '', phone: '', role: 'user' });
                fetchUsers();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ไม่สามารถสร้างผู้ใช้ได้',
                    text: data.error || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
                    confirmButtonColor: '#1e3a8a'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'เชื่อมต่อกับเซิร์ฟเวอร์ล้มเหลว',
                confirmButtonColor: '#1e3a8a'
            });
        }
    };

    const handleChangeRole = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        const result = await Swal.fire({
            title: 'ยืนยันการเปลี่ยนสิทธิ์?',
            text: `ต้องการเปลี่ยนสิทธิ์ผู้ใช้เป็น ${newRole} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e3a8a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, เปลี่ยนเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/admin/users/${userId}/role`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: newRole })
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('สำเร็จ!', 'เปลี่ยนสิทธิ์เรียบร้อยแล้ว', 'success');
                    fetchUsers();
                }
            } catch (error) {
                Swal.fire('ผิดพลาด!', 'ไม่สามารถเปลี่ยนสิทธิ์ได้', 'error');
            }
        }
    };

    const handleDeleteUser = async (userId: number) => {
        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: "การลบผู้ใช้จะไม่สามารถกู้คืนได้!",
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
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'ผู้ใช้ถูกลบออกจากระบบแล้ว', 'success');
                    fetchUsers();
                } else {
                    Swal.fire('ผิดพลาด!', data.error || 'ไม่สามารถลบผู้ใช้ได้', 'error');
                }
            } catch (error) {
                Swal.fire('ผิดพลาด!', 'เชื่อมต่อกับเซิร์ฟเวอร์ล้มเหลว', 'error');
            }
        }
    };

    const handleEditClick = (user: User) => {
        setEditUser(user);
        setEditFormData({
            full_name: user.full_name || '',
            phone: user.phone || '',
            status: user.status || 'active'
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${editUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });

            const data = await response.json();
            if (data.success) {
                Swal.fire('สำเร็จ', 'อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว', 'success');
                setShowEditModal(false);
                fetchUsers();
            } else {
                Swal.fire('ผิดพลาด', data.error, 'error');
            }
        } catch (error) {
            Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        }
    };

    const handlePasswordClick = (userId: number) => {
        setPasswordUserId(userId);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordUserId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${passwordUserId}/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: newPassword })
            });

            const data = await response.json();
            if (data.success) {
                Swal.fire('สำเร็จ', 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว', 'success');
                setShowPasswordModal(false);
            } else {
                Swal.fire('ผิดพลาด', data.error, 'error');
            }
        } catch (error) {
            Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้</h1>
                    <p className="text-slate-500">ดูข้อมูลและจัดการสิทธิ์การใช้งาน</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>เพิ่มผู้ใช้ใหม่</span>
                </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue transition"
                    />
                </div>
                {/* Add Filter Dropdown here if needed */}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">ผู้ใช้งาน</th>
                                <th className="p-4 font-semibold">ข้อมูลติดต่อ</th>
                                <th className="p-4 font-semibold">สิทธิ์</th>
                                <th className="p-4 font-semibold">สถานะ</th>
                                <th className="p-4 font-semibold">วันที่สมัคร</th>
                                <th className="p-4 font-semibold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-phayao-blue"></div>
                                            กำลังโหลดข้อมูล...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">ไม่พบข้อมูลผู้ใช้</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{user.username}</p>
                                                    <p className="text-sm text-slate-500">{user.full_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail size={14} />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone size={14} />
                                                    {user.phone || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                                                {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'suspended'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.status === 'suspended' ? 'ถูกระงับ' : 'ปกติ'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(user.created_at).toLocaleDateString('th-TH')}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleChangeRole(user.id, user.role)}
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm"
                                                    title="เปลี่ยนสิทธิ์"
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                                    title="แก้ไขข้อมูล"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handlePasswordClick(user.id)}
                                                    className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition shadow-sm"
                                                    title="เปลี่ยนรหัสผ่าน"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                                                    title="ลบผู้ใช้"
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
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Create User Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                <h2 className="text-xl font-bold text-slate-800">เพิ่มผู้ใช้ใหม่</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>
                            <div className="overflow-y-auto">
                                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">สิทธิ์การใช้งาน</label>
                                        <select
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="user">สมาชิกทั่วไป</option>
                                            <option value="admin">ผู้ดูแลระบบ</option>
                                        </select>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-800 transition font-medium shadow-lg shadow-blue-900/20"
                                        >
                                            บันทึก
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                showEditModal && editUser && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                <h2 className="text-xl font-bold text-slate-800">แก้ไขข้อมูลผู้ใช้</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>
                            <div className="overflow-y-auto">
                                <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
                                        <input type="text" disabled value={editUser.username} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                                        <input
                                            type="text"
                                            value={editFormData.full_name}
                                            onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                        <input
                                            type="tel"
                                            value={editFormData.phone}
                                            onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                                        <select
                                            value={editFormData.status}
                                            onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                        >
                                            <option value="active">ปกติ (Active)</option>
                                            <option value="suspended">ระงับการใช้งาน (Suspended)</option>
                                        </select>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">ยกเลิก</button>
                                        <button type="submit" className="flex-1 px-4 py-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-800 transition font-medium">บันทึก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Reset Password Modal */}
            {
                showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                <h2 className="text-xl font-bold text-slate-800">เปลี่ยนรหัสผ่าน</h2>
                                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>
                            <div className="overflow-y-auto">
                                <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                            placeholder="อย่างน้อย 6 ตัวอักษร"
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">ยกเลิก</button>
                                        <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">เปลี่ยนรหัสผ่าน</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminUsers;
