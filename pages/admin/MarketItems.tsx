import React, { useState, useEffect } from 'react';
import { usePreventRefresh } from '../../hooks/usePreventRefresh';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    ShoppingBag,
    Tag,
    MapPin,
    DollarSign,
    Filter,
    ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/admin/Pagination';

interface MarketItem {
    id: number;
    title: string;
    price: number;
    status: string;
    username: string;
    category_name: string;
    created_at: string;
    image_url?: string;
    description?: string;
    category_id?: number;
    location?: string;
    contact_phone?: string;
    contact_line?: string;
    condition_type?: string;
    images?: { id: number; image_url: string }[];
}

const AdminMarketItems: React.FC = () => {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        location: '',
        contact_phone: '',
        contact_line: '',
        condition_type: 'used',
        user_id: '',
        status: 'available'
    });
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    // Prevent accidental refresh when modal is open
    usePreventRefresh(showCreateModal);

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, [filter, currentPage]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/categories?type=market', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
                if (data.data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: data.data[0].id.toString() }));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `/api/admin/market-items?page=${currentPage}&limit=20`;
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
                setItems(data.data);
                setTotalPages(Math.ceil((data.total || 0) / 20) || 1);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลสินค้าได้', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (itemId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/market-items/${itemId}/status`, {
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
                fetchItems();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDelete = async (itemId: number) => {
        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: "การลบสินค้าจะไม่สามารถกู้คืนได้!",
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
                const response = await fetch(`/api/admin/market-items/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'สินค้าถูกลบออกจากระบบแล้ว', 'success');
                    fetchItems();
                } else {
                    Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            price: '',
            category_id: categories[0]?.id.toString() || '',
            location: '',
            contact_phone: '',
            contact_line: '',
            condition_type: 'used',
            user_id: '',
            status: 'available'
        });
        setImageFiles([]);
        setPreviewImages([]);
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let uploadedImageUrls: string[] = [];

            // Upload new images
            if (imageFiles.length > 0) {
                const uploadFormData = new FormData();
                imageFiles.forEach(file => {
                    uploadFormData.append('files', file);
                });

                const uploadRes = await fetch('/api/upload/multiple?folder=market', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadFormData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    uploadedImageUrls = uploadData.files.map((f: any) => f.url);
                } else {
                    Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ: ' + (uploadData.error || 'Unknown error'), 'error');
                    return;
                }
            }

            // Combine existing preview images (that are not newly uploaded files) with new uploaded urls
            const existingUrls = previewImages.filter(url => url.startsWith('/uploads') || url.startsWith('http'));
            const finalImageUrls = [...existingUrls, ...uploadedImageUrls];

            // Use the first image as the main image_url
            const mainImageUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : '';

            const url = isEditing ? `/api/admin/market-items/${editingId}` : '/api/admin/market-items';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    image_url: mainImageUrl,
                    images: finalImageUrls
                })
            });
            const data = await response.json();
            if (data.success) {
                Swal.fire('สำเร็จ', isEditing ? 'แก้ไขข้อมูลเรียบร้อย' : 'สร้างสินค้าใหม่เรียบร้อยแล้ว', 'success');
                setShowCreateModal(false);
                resetForm();
                fetchItems();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleEdit = async (item: MarketItem) => {
        setIsEditing(true);
        setEditingId(item.id);

        // Fetch full details including images
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/market-items/${item.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                const fullItem = data.data;
                setFormData({
                    title: fullItem.title,
                    description: fullItem.description || '',
                    price: fullItem.price.toString(),
                    category_id: fullItem.category_id?.toString() || categories[0]?.id.toString(),
                    location: fullItem.location || '',
                    contact_phone: fullItem.contact_phone || '',
                    contact_line: fullItem.contact_line || '',
                    condition_type: fullItem.condition_type || 'used',
                    user_id: '',
                    status: fullItem.status
                });

                if (fullItem.images && fullItem.images.length > 0) {
                    setPreviewImages(fullItem.images.map((img: any) => img.image_url));
                } else if (fullItem.image_url) {
                    setPreviewImages([fullItem.image_url]);
                } else {
                    setPreviewImages([]);
                }
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
        }

        setShowCreateModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = previewImages.length + files.length;

            if (totalImages > 10) {
                Swal.fire('แจ้งเตือน', 'อัพโหลดรูปภาพได้สูงสุด 10 รูป', 'warning');
                return;
            }

            setImageFiles(prev => [...prev, ...files]);

            // Create preview URLs
            const newPreviews = files.map((file: File) => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        // We also need to remove from imageFiles if it was a newly added file.
        // This is tricky because previewImages mixes existing URLs and new blob URLs.
        // But for simplicity, we can just rebuild imageFiles? No, that's hard.
        // Let's just keep it simple: if we remove an image, we remove it from preview.
        // When submitting, we only upload files that correspond to remaining blob URLs?
        // Actually, the easiest way is to clear imageFiles and rely on the user re-selecting if they mess up,
        // OR, we can track which preview corresponds to which file.

        // Improved logic:
        // If we remove an image, we just remove it from previewImages.
        // But we also need to remove it from imageFiles if it's a new file.
        // Since we append new files to the end, we can try to sync them.
        // But it's complex.

        // Alternative: Just clear all new files when removing one? No.

        // Let's just remove from previewImages. 
        // And when uploading, we upload ALL imageFiles.
        // BUT, if the user removed a preview that corresponded to a file, we shouldn't upload that file.
        // This mismatch is a bug source.

        // Better approach for this iteration:
        // When removing, if it's a blob url, revoke it.
        // We won't try to sync imageFiles perfectly in this simple version, 
        // but we should try to avoid uploading deleted images.

        // Let's just reset imageFiles to empty if any change happens? No.

        // Correct way:
        // We need to know if a preview image is from existing URL or new File.
        // If it's a new File, we need to know WHICH file.

        // For now, to satisfy the requirement "upload up to 10 images", 
        // I will just implement the removal from preview. 
        // If the user removes a "new" image, it might still be uploaded but not linked? 
        // No, that's bad.

        // Let's restart `imageFiles` state management.
        // Actually, we can just use `previewImages` to drive everything if we store objects.
        // { type: 'url' | 'file', content: string | File }

        // But I don't want to refactor too much.
        // I'll just remove from `imageFiles` by index offset?
        // Existing images are at the start. New images are at the end.
        // Calculate how many existing images are there.

        const existingCount = previewImages.filter(url => !url.startsWith('blob:')).length;
        if (index >= existingCount) {
            // It's a new file
            const fileIndex = index - existingCount;
            setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
        }

        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'sold': return 'bg-gray-100 text-gray-800';
            case 'reserved': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available': return 'พร้อมขาย';
            case 'sold': return 'ขายแล้ว';
            case 'reserved': return 'จองแล้ว';
            case 'inactive': return 'ไม่แสดง';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการสินค้า</h1>
                    <p className="text-slate-500">ตรวจสอบและจัดการรายการสินค้าในตลาด</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>เพิ่มสินค้า</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <Filter size={20} className="text-slate-400 mr-2" />
                    {['all', 'available', 'sold', 'reserved', 'inactive'].map((status) => (
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
                                <th className="p-4 font-semibold">สินค้า</th>
                                <th className="p-4 font-semibold">ราคา</th>
                                <th className="p-4 font-semibold">หมวดหมู่</th>
                                <th className="p-4 font-semibold">ผู้ขาย</th>
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
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">ไม่พบข้อมูลสินค้า</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ShoppingBag className="text-slate-400" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 line-clamp-1">{item.title}</p>
                                                    <p className="text-xs text-slate-500">ID: {item.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-700">
                                            ฿{item.price.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                <Tag size={12} />
                                                {item.category_name}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {item.username}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${getStatusBadge(item.status)}`}
                                            >
                                                <option value="available">พร้อมขาย</option>
                                                <option value="sold">ขายแล้ว</option>
                                                <option value="reserved">จองแล้ว</option>
                                                <option value="inactive">ไม่แสดง</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                                                    title="ลบสินค้า"
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
            </div >

            {/* Create Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-6">
                                <form onSubmit={handleCreateItem} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อสินค้า *</label>
                                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท) *</label>
                                            <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
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
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" rows={3} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">สภาพสินค้า</label>
                                            <select value={formData.condition_type} onChange={(e) => setFormData({ ...formData, condition_type: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition">
                                                <option value="new">สินค้าใหม่</option>
                                                <option value="used">สินค้ามือสอง</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่นัดรับ</label>
                                            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" placeholder="ระบุสถานที่..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                            <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Line ID</label>
                                            <input type="text" value={formData.contact_line} onChange={(e) => setFormData({ ...formData, contact_line: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                        </div>
                                    </div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพ (สูงสุด 10 รูป)</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative mb-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={previewImages.length >= 10}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <ImageIcon size={24} />
                                            <span className="text-sm">คลิกเพื่ออัพโหลดรูปภาพ</span>
                                            <span className="text-xs text-slate-400">({previewImages.length}/10)</span>
                                        </div>
                                    </div>

                                    {previewImages.length > 0 && (
                                        <div className="grid grid-cols-5 gap-2">
                                            {previewImages.map((url, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition">
                                                <option value="available">พร้อมขาย</option>
                                                <option value="sold">ขายแล้ว</option>
                                                <option value="reserved">จองแล้ว</option>
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
                )
            }
        </div >
    );
};

export default AdminMarketItems;
