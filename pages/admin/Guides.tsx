import React, { useState, useEffect } from 'react';
import { usePreventRefresh } from '../../hooks/usePreventRefresh';
import { Plus, Edit2, Trash2, Eye, Star, ImageIcon, X } from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/admin/Pagination';

interface Guide {
    id: number;
    title: string;
    category: string;
    description?: string;
    content?: string;
    image_url?: string;
    images?: { id: number, image_url: string }[];
    is_featured: boolean;
    status: string;
    view_count: number;
    created_at: string;
}

const AdminGuides: React.FC = () => {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: 'เที่ยว',
        image_url: '',
        is_featured: false,
        status: 'published'
    });

    // Multiple images handling
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // Prevent accidental refresh when modal is open
    usePreventRefresh(showModal);

    useEffect(() => {
        fetchGuides();
    }, [activeCategory, currentPage]);

    const fetchGuides = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `/api/admin/guides?page=${currentPage}&limit=20`;
            if (activeCategory !== 'all') {
                url += `&category=${activeCategory}`;
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setGuides(data.data);
                setTotalPages(Math.ceil((data.total || 0) / 20) || 1);
            }
        } catch (error) {
            console.error('Error fetching guides:', error);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลได้', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let uploadedImageUrls: string[] = [];

            // Upload new files
            if (imageFiles.length > 0) {
                const uploadFormData = new FormData();
                imageFiles.forEach(file => {
                    uploadFormData.append('files', file);
                });

                const uploadRes = await fetch('/api/upload/multiple?folder=guides', {
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

            // Combine existing images (that weren't deleted) with new uploaded images
            const allImages = [...existingImages, ...uploadedImageUrls];

            // Use the first image as the main image_url if available, otherwise keep existing or empty
            const mainImageUrl = allImages.length > 0 ? allImages[0] : '';

            const url = isEditing ? `/api/admin/guides/${editingId}` : '/api/admin/guides';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    image_url: mainImageUrl,
                    images: allImages
                })
            });

            const data = await response.json();
            if (data.success) {
                Swal.fire('สำเร็จ', isEditing ? 'แก้ไขข้อมูลเรียบร้อย' : 'เพิ่มข้อมูลเรียบร้อย', 'success');
                setShowModal(false);
                resetForm();
                fetchGuides();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleEdit = async (guide: Guide) => {
        setIsEditing(true);
        setEditingId(guide.id);

        // Fetch full guide details including images
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/guides/${guide.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                const fullGuide = data.data;
                setFormData({
                    title: fullGuide.title,
                    description: fullGuide.description || '',
                    content: fullGuide.content || '',
                    category: fullGuide.category,
                    image_url: fullGuide.image_url || '',
                    is_featured: fullGuide.is_featured,
                    status: fullGuide.status
                });

                // Set existing images
                const images = fullGuide.images?.map((img: any) => img.image_url) || [];
                // If no images in guide_images table but has image_url, use that
                if (images.length === 0 && fullGuide.image_url) {
                    images.push(fullGuide.image_url);
                }

                setExistingImages(images);
                setPreviewImages(images); // Show existing images in preview
                setImageFiles([]); // Reset new files
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching guide details:', error);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลรายละเอียดได้', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: 'การลบข้อมูลจะไม่สามารถกู้คืนได้!',
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
                const response = await fetch(`/api/admin/guides/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบออกจากระบบแล้ว', 'success');
                    fetchGuides();
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
            content: '',
            category: 'เที่ยว',
            image_url: '',
            is_featured: false,
            status: 'published'
        });
        setImageFiles([]);
        setPreviewImages([]);
        setExistingImages([]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];

            // Check max files limit (15)
            const totalFiles = existingImages.length + imageFiles.length + files.length;
            if (totalFiles > 15) {
                Swal.fire('แจ้งเตือน', 'อัปโหลดรูปภาพได้สูงสุด 15 รูป', 'warning');
                return;
            }

            setImageFiles(prev => [...prev, ...files]);

            // Generate previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        // Calculate if the index refers to an existing image or a new file
        if (index < existingImages.length) {
            // Removing existing image
            const newExisting = [...existingImages];
            newExisting.splice(index, 1);
            setExistingImages(newExisting);

            // Update preview
            const newPreviews = [...previewImages];
            newPreviews.splice(index, 1);
            setPreviewImages(newPreviews);
        } else {
            // Removing new file
            const fileIndex = index - existingImages.length;
            const newFiles = [...imageFiles];
            newFiles.splice(fileIndex, 1);
            setImageFiles(newFiles);

            // Update preview
            const newPreviews = [...previewImages];
            newPreviews.splice(index, 1);
            setPreviewImages(newPreviews);
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'เที่ยว': return 'ที่เที่ยว';
            case 'พัก': return 'ที่พัก';
            case 'กิน': return 'ร้านอาหาร';
            default: return category;
        }
    };

    const filteredGuides = activeCategory === 'all'
        ? guides
        : guides.filter(g => g.category === activeCategory);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการ กิน-เที่ยว-พัก</h1>
                    <p className="text-slate-500">จัดการข้อมูลสถานที่ท่องเที่ยว ที่พัก และร้านอาหาร</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>เพิ่มข้อมูล</span>
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'เที่ยว', label: 'ที่เที่ยว' },
                    { id: 'พัก', label: 'ที่พัก' },
                    { id: 'กิน', label: 'ร้านอาหาร' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveCategory(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeCategory === tab.id
                            ? 'bg-phayao-blue text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-slate-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">รายการ</th>
                                <th className="p-4 font-semibold">หมวดหมู่</th>
                                <th className="p-4 font-semibold">สถานะ</th>
                                <th className="p-4 font-semibold">ยอดเข้าชม</th>
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
                            ) : filteredGuides.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">ไม่พบข้อมูล</td>
                                </tr>
                            ) : (
                                filteredGuides.map((guide) => (
                                    <tr key={guide.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {guide.image_url && (
                                                    <img src={guide.image_url} alt={guide.title} className="w-16 h-16 rounded-lg object-cover" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-800">{guide.title}</p>
                                                    {guide.is_featured && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                                                            <Star size={12} fill="currentColor" />
                                                            แนะนำ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {getCategoryLabel(guide.category)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${guide.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {guide.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <Eye size={16} />
                                                <span>{guide.view_count}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(guide)}
                                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(guide.id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                                                    title="ลบข้อมูล"
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
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {isEditing ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none"
                                    >
                                        <option value="เที่ยว">ที่เที่ยว</option>
                                        <option value="พัก">ที่พัก</option>
                                        <option value="กิน">ร้านอาหาร</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบายสั้น</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">เนื้อหาแบบเต็ม</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none"
                                        rows={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพ (สูงสุด 15 รูป)</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <ImageIcon size={24} />
                                            <span className="text-sm">คลิกเพื่ออัปโหลดรูปภาพ</span>
                                            <span className="text-xs text-gray-400">เลือกได้หลายรูปพร้อมกัน</span>
                                        </div>
                                    </div>

                                    {/* Image Preview Grid */}
                                    {previewImages.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {previewImages.map((url, index) => (
                                                <div key={index} className="relative group aspect-square">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index}`}
                                                        className="w-full h-full object-cover rounded-lg border border-slate-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    {index === 0 && (
                                                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                            รูปหลัก
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                        {previewImages.length} / 15 รูป
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_featured}
                                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                            className="w-4 h-4 text-phayao-blue rounded focus:ring-2 focus:ring-phayao-blue/20"
                                        />
                                        <span className="text-sm text-slate-700">แสดงเป็นรายการแนะนำ</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none"
                                    >
                                        <option value="published">เผยแพร่</option>
                                        <option value="draft">ฉบับร่าง</option>
                                        <option value="archived">เก็บถาวร</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
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
            )}
        </div>
    );
};

export default AdminGuides;
