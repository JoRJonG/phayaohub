import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    MessageSquare,
    Heart,
    Eye,
    Image as ImageIcon,
    Edit
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

interface Post {
    id: number;
    title: string;
    content: string;
    category: string;
    status: string;
    like_count: number;
    comment_count: number;
    created_at: string;
    image_url?: string;
}

const MyPosts: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '', category: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/categories?type=community', {
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
            const response = await fetch('/api/user/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                setPosts([]);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleStatusChange = async (postId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/user/posts/${postId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                const statusText = newStatus === 'active' ? 'ใช้งาน' : 'ซ่อน';
                Swal.fire({
                    icon: 'success',
                    title: 'อัพเดทสถานะสำเร็จ',
                    text: `เปลี่ยนสถานะเป็น ${statusText} แล้ว`,
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchPosts();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัพเดทสถานะ', 'error');
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
                const response = await fetch(`/api/user/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'โพสต์ถูกลบแล้ว', 'success');
                    fetchPosts();
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
            let image_url = previewImage || '';

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
                }
            }

            const url = isEditing ? `/api/user/posts/${editingId}` : '/api/user/posts';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, image_url })
            });
            const data = await response.json();
            if (data.success) {
                Swal.fire('สำเร็จ', isEditing ? 'แก้ไขโพสต์เรียบร้อย' : 'สร้างโพสต์ใหม่เรียบร้อยแล้ว', 'success');
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
            category: post.category
        });
        setPreviewImage(post.image_url || null);
        setShowCreateModal(true);
    };

    const decodeHTML = (html: string) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ title: '', content: '', category: categories[0]?.name || '' });
        setImageFile(null);
        setPreviewImage(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">โพสต์ของฉัน</h1>
                    <p className="text-slate-500">จัดการโพสต์ในชุมชนของคุณ</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>ตั้งกระทู้ใหม่</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
                ) : posts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <MessageSquare size={48} className="text-slate-300 mb-4" />
                        <p>คุณยังไม่มีโพสต์</p>
                        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="mt-4 text-phayao-blue hover:underline">
                            เริ่มตั้งกระทู้แรกของคุณ
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {posts.map((post) => (
                            <div key={post.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                                        {post.image_url ? (
                                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <MessageSquare className="text-slate-400" size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-lg">{decodeHTML(post.title)}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-1">{post.content}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{post.category}</span>
                                            <span className="flex items-center gap-1"><Heart size={12} /> {post.like_count}</span>
                                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comment_count}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-center">
                                    <select
                                        value={post.status}
                                        onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer appearance-none ${post.status === 'active' ? 'bg-green-100 text-green-700' :
                                            post.status === 'hidden' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        <option value="active">ใช้งาน</option>
                                        <option value="hidden">ซ่อน</option>
                                    </select>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                        title="แก้ไข"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
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
                            <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'แก้ไขโพสต์' : 'ตั้งกระทู้ใหม่'}</h2>
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
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative overflow-hidden group">
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImageFile(file);
                                                setPreviewImage(URL.createObjectURL(file));
                                            }
                                        }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />

                                        {previewImage ? (
                                            <div className="relative h-48 w-full">
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white font-medium">คลิกเพื่อเปลี่ยนรูป</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-500 py-8">
                                                <ImageIcon size={32} className="text-slate-300" />
                                                <span className="text-sm">คลิกเพื่ออัพโหลดรูปภาพ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
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

export default MyPosts;
