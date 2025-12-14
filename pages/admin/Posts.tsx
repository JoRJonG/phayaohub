import React, { useState, useEffect } from 'react';
import { usePreventRefresh } from '../../hooks/usePreventRefresh';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    MessageSquare,
    Heart,
    Image as ImageIcon,
    Filter,
    Eye,
    User
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/admin/Pagination';

interface Post {
    id: number;
    title: string;
    content: string;
    category: string;
    status: string;
    username: string;
    full_name: string;
    like_count: number;
    comment_count: number;
    created_at: string;
    image_url?: string;
}

interface Comment {
    id: number;
    content: string;
    username: string;
    full_name: string;
    avatar_url: string;
    created_at: string;
}

const AdminPosts: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '', category: '', user_id: '', status: 'active' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

    // Comment Management State
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);

    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    // Bulk Delete State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Prevent accidental refresh when modal is open
    usePreventRefresh(showCreateModal);

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, [filter, currentPage]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/categories?type=community', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                setCategories(data.data);
                if (!formData.category) {
                    setFormData(prev => ({ ...prev, category: data.data[0].name }));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `/api/admin/posts?page=${currentPage}&limit=20`;
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
                setPosts(data.data);
                setTotalPages(Math.ceil((data.total || 0) / 20) || 1);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลโพสต์ได้', 'error');
        } finally {
            setIsLoading(false);
        }
    };



    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: `คุณต้องการลบโพสต์ ${selectedIds.length} รายการที่เลือกใช่หรือไม่? การกระทำนี้ไม่สามารถกู้คืนได้!`,
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
                const response = await fetch('/api/admin/posts/bulk-delete', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ids: selectedIds })
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', `ลบโพสต์ ${selectedIds.length} รายการเรียบร้อยแล้ว`, 'success');
                    setSelectedIds([]);
                    fetchPosts();
                } else {
                    Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === posts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(posts.map(p => p.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleStatusChange = async (postId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/posts/${postId}/status`, {
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
                fetchPosts();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDelete = async (postId: number) => {
        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: "การลบโพสต์จะไม่สามารถกู้คืนได้!",
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
                const response = await fetch(`/api/admin/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'โพสต์ถูกลบออกจากระบบแล้ว', 'success');
                    fetchPosts();
                } else {
                    Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };



    const fetchComments = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/posts/${postId}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setComments(data.data);
                setSelectedPostId(postId);
                setShowCommentsModal(true);
            } else {
                Swal.fire('Error', 'ไม่สามารถดึงข้อมูลความคิดเห็นได้', 'error');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: "การลบความคิดเห็นจะไม่สามารถกู้คืนได้!",
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
                const response = await fetch(`/api/admin/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'ความคิดเห็นถูกลบแล้ว', 'success');
                    // Refresh comments list
                    if (selectedPostId) {
                        fetchComments(selectedPostId);
                        // Also refresh posts to update comment count
                        fetchPosts();
                    }
                } else {
                    Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let image_url = isEditing ? (posts.find(p => p.id === editingId)?.image_url || '') : '';

            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                const uploadRes = await fetch('/api/upload/single?folder=posts', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadFormData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    image_url = uploadData.url;
                } else {
                    Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ: ' + (uploadData.error || 'Unknown error'), 'error');
                    return;
                }
            }

            const url = isEditing ? `/api/admin/posts/${editingId}` : '/api/admin/posts';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, image_url })
            });
            const data = await response.json();
            if (data.success) {
                Swal.fire('สำเร็จ', isEditing ? 'แก้ไขข้อมูลเรียบร้อย' : 'สร้างโพสต์ใหม่เรียบร้อยแล้ว', 'success');
                setShowCreateModal(false);
                resetForm();
                fetchPosts();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleEdit = (post: Post) => {
        setIsEditing(true);
        setEditingId(post.id);
        setFormData({
            title: post.title,
            content: post.content,
            category: post.category,
            user_id: '',
            status: post.status
        });
        setPreviewImage(post.image_url || null);
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ title: '', content: '', category: categories[0]?.name || '', user_id: '', status: 'active' });
        setImageFile(null);
        setPreviewImage(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'hidden': return 'bg-gray-100 text-gray-800';
            case 'deleted': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const decodeHTML = (html: string) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'ใช้งาน';
            case 'hidden': return 'ซ่อน';
            case 'deleted': return 'ลบแล้ว';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการโพสต์</h1>
                    <p className="text-slate-500">ตรวจสอบและจัดการโพสต์ในชุมชน</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>เพิ่มโพสต์</span>
                </button>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-red-800 font-medium">
                        <Trash2 size={20} />
                        <span>เลือก {selectedIds.length} รายการ</span>
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm text-sm font-medium"
                    >
                        ลบที่เลือก ({selectedIds.length})
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <Filter size={20} className="text-slate-400 mr-2" />
                    {['all', 'active', 'hidden', 'deleted'].map((status) => (
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
                                <th className="p-4 w-4">
                                    <input
                                        type="checkbox"
                                        checked={posts.length > 0 && selectedIds.length === posts.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 text-phayao-blue focus:ring-phayao-blue"
                                    />
                                </th>
                                <th className="p-4 font-semibold">โพสต์</th>
                                <th className="p-4 font-semibold">ผู้โพสต์</th>
                                <th className="p-4 font-semibold">หมวดหมู่</th>
                                <th className="p-4 font-semibold">การมีส่วนร่วม</th>
                                <th className="p-4 font-semibold">สถานะ</th>
                                <th className="p-4 font-semibold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-phayao-blue"></div>
                                            กำลังโหลดข้อมูล...
                                        </div>
                                    </td>
                                </tr>
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">ไม่พบข้อมูลโพสต์</td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.includes(post.id) ? 'bg-blue-50/50' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(post.id)}
                                                onChange={() => toggleSelect(post.id)}
                                                className="rounded border-slate-300 text-phayao-blue focus:ring-phayao-blue"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {post.image_url ? (
                                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <MessageSquare className="text-slate-400" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 line-clamp-1">{decodeHTML(post.title)}</p>
                                                    <p className="text-sm text-slate-500 line-clamp-1">{post.content}</p>
                                                    {post.image_url && (
                                                        <a href={post.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                            <Eye size={12} /> ดูรูปภาพ
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {post.full_name || post.username}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {post.category || 'ทั่วไป'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Heart size={14} className="text-rose-400" />
                                                    {post.like_count}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare size={14} className="text-blue-400" />
                                                    {post.comment_count}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={post.status}
                                                onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${getStatusBadge(post.status)}`}
                                            >
                                                <option value="active">ใช้งาน</option>
                                                <option value="hidden">ซ่อน</option>
                                                <option value="deleted">ลบแล้ว</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => fetchComments(post.id)}
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm"
                                                    title="ดูความคิดเห็น"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                                                    title="ลบโพสต์"
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
                            <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'แก้ไขโพสต์' : 'เพิ่มโพสต์ใหม่'}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อ *</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">เนื้อหา *</label>
                                    <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" rows={4} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition"
                                    >
                                        <option value="">เลือกหมวดหมู่</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพ</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setImageFile(file);
                                                if (file) {
                                                    setPreviewImage(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {previewImage ? (
                                            <div className="relative w-full h-48">
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition rounded-lg">
                                                    <span className="text-white text-sm font-medium">คลิกเพื่อเปลี่ยนรูป</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-500 py-8">
                                                <ImageIcon size={24} />
                                                <span className="text-sm">คลิกเพื่ออัพโหลดรูปภาพ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition">
                                            <option value="active">ใช้งาน</option>
                                            <option value="hidden">ซ่อน</option>
                                            <option value="deleted">ลบแล้ว</option>
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

            {/* Comments Modal */}
            {showCommentsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">จัดการความคิดเห็น</h2>
                            <button onClick={() => setShowCommentsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            {comments.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">ไม่มีความคิดเห็น</div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="bg-slate-50 p-4 rounded-xl flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                                {comment.avatar_url ? (
                                                    <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <span className="font-semibold text-slate-900 mr-2">{comment.full_name || comment.username}</span>
                                                        <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString('th-TH')}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="ลบความคิดเห็น"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-slate-700 whitespace-pre-line">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPosts;
