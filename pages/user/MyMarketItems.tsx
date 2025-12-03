import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    ShoppingBag,
    Tag,
    Image as ImageIcon,
    Edit
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

interface MarketItem {
    id: number;
    title: string;
    description?: string;
    price: number;
    status: string;
    category_id: number;
    category_name: string;
    location?: string;
    contact_phone?: string;
    contact_line?: string;
    created_at: string;
    image_url?: string;
    images?: { id: number, image_url: string }[];
}

const MyMarketItems: React.FC = () => {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', price: '', category_id: '', location: '', contact_phone: '', contact_line: '' });
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    // Unified image state to handle both existing and new images
    const [itemImages, setItemImages] = useState<{ type: 'existing' | 'new', url: string, file?: File }[]>([]);
    const [editItem, setEditItem] = useState<MarketItem | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/categories?type=market', {
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
            const response = await fetch('/api/user/market-items', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                setItems([]);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (itemId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/user/market-items/${itemId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                const statusText = newStatus === 'available' ? 'พร้อมขาย' : newStatus === 'sold' ? 'ขายแล้ว' : 'จองแล้ว';
                Swal.fire({
                    icon: 'success',
                    title: 'อัพเดทสถานะสำเร็จ',
                    text: `เปลี่ยนสถานะเป็น ${statusText} แล้ว`,
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchItems();
            } else {
                Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัพเดทสถานะ', 'error');
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
                const response = await fetch(`/api/user/market-items/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('ลบสำเร็จ!', 'สินค้าถูกลบแล้ว', 'success');
                    fetchItems();
                } else {
                    Swal.fire('Error', data.error || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            const remainingSlots = 10 - itemImages.length;

            if (remainingSlots <= 0) {
                Swal.fire('แจ้งเตือน', 'สามารถอัพโหลดรูปภาพได้สูงสุด 10 รูป', 'warning');
                return;
            }

            const newFiles = files.slice(0, remainingSlots);
            const newImageItems = newFiles.map(file => ({
                type: 'new' as const,
                url: URL.createObjectURL(file),
                file: file
            }));

            setItemImages([...itemImages, ...newImageItems]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...itemImages];
        const removed = newImages[index];
        if (removed.type === 'new') {
            URL.revokeObjectURL(removed.url);
        }
        newImages.splice(index, 1);
        setItemImages(newImages);
    };

    const handleEdit = async (item: MarketItem) => {
        try {
            // Fetch full details including images
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/user/market-items/${item.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                const fullItem = data.data;
                setEditItem(fullItem);
                setFormData({
                    title: fullItem.title,
                    description: fullItem.description || '',
                    price: fullItem.price.toString(),
                    category_id: fullItem.category_id?.toString() || categories[0]?.id?.toString() || '',
                    location: fullItem.location || '',
                    contact_phone: fullItem.contact_phone || '',
                    contact_line: fullItem.contact_line || ''
                });

                // Map existing images
                const existingImages = fullItem.images && fullItem.images.length > 0
                    ? fullItem.images.map((img: any) => ({
                        type: 'existing' as const,
                        url: img.image_url
                    }))
                    : (fullItem.image_url ? [{ type: 'existing' as const, url: fullItem.image_url }] : []);

                setItemImages(existingImages);
                setShowCreateModal(true);
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลสินค้าได้', 'error');
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', price: '', category_id: categories[0]?.id.toString() || '', location: '', contact_phone: '', contact_line: '' });
        setItemImages([]);
        setEditItem(null);
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Upload new images
            const newFilesToUpload = itemImages.filter(img => img.type === 'new').map(img => img.file as File);
            let uploadedUrls: string[] = [];

            if (newFilesToUpload.length > 0) {
                const uploadFormData = new FormData();
                newFilesToUpload.forEach(file => {
                    uploadFormData.append('files', file);
                });

                const token = localStorage.getItem('token');
                const uploadRes = await fetch('/api/upload/multiple?folder=market', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadFormData
                });

                const uploadData = await uploadRes.json();
                if (!uploadData.success) {
                    throw new Error(uploadData.error || 'Upload failed');
                }
                uploadedUrls = uploadData.files.map((f: any) => f.url);
            }

            // 2. Construct final image list (preserving order)
            let uploadIndex = 0;
            const finalImages = itemImages.map(img => {
                if (img.type === 'existing') {
                    return img.url;
                } else {
                    return uploadedUrls[uploadIndex++];
                }
            });

            // 3. Create or Update Item
            const url = editItem
                ? `/api/user/market-items/${editItem.id}`
                : '/api/user/market-items';

            const method = editItem ? 'PUT' : 'POST';
            const token = localStorage.getItem('token');

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    category_id: parseInt(formData.category_id),
                    images: finalImages,
                    image_url: finalImages[0] || '' // Fallback for legacy support
                })
            });

            const data = await res.json();

            if (data.success) {
                Swal.fire('สำเร็จ', editItem ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'สร้างสินค้าใหม่เรียบร้อยแล้ว', 'success');
                setShowCreateModal(false);
                resetForm();
                fetchItems();
            } else {
                Swal.fire('ผิดพลาด', data.error, 'error');
            }
        } catch (error) {
            console.error('Create/Update item error:', error);
            Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">สินค้าของฉัน</h1>
                    <p className="text-slate-500">จัดการสินค้าที่คุณลงขาย</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>ลงขายสินค้า</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <ShoppingBag size={48} className="text-slate-300 mb-4" />
                        <p>คุณยังไม่มีสินค้าที่ลงขาย</p>
                        <button onClick={() => setShowCreateModal(true)} className="mt-4 text-phayao-blue hover:underline">
                            เริ่มลงขายสินค้าแรกของคุณ
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag className="text-slate-400" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-lg">{item.title}</h3>
                                        <p className="text-phayao-blue font-bold">฿{item.price.toLocaleString()}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Tag size={12} /> {item.category_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-center">
                                    <select
                                        value={item.status}
                                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer appearance-none ${item.status === 'available' ? 'bg-green-100 text-green-700' :
                                            item.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                                                item.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        <option value="available">พร้อมขาย</option>
                                        <option value="reserved">จองแล้ว</option>
                                        <option value="sold">ขายแล้ว</option>
                                    </select>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                        title="แก้ไข"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
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
                            <h2 className="text-xl font-bold text-slate-800">{editItem ? 'แก้ไขสินค้า' : 'ลงขายสินค้าใหม่'}</h2>
                            <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
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
                                        <label className="block text-sm font-medium text-slate-700 mb-1">อำเภอ/สถานที่นัดรับ</label>
                                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" placeholder="เช่น อ.เมือง, หน้า ม.พะเยา" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                            <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Line ID</label>
                                            <input type="text" value={formData.contact_line} onChange={(e) => setFormData({ ...formData, contact_line: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-phayao-blue/20 focus:border-phayao-blue outline-none transition" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพ (สูงสุด 10 รูป)</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={itemImages.length >= 10}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <ImageIcon size={24} />
                                            <span className="text-sm">คลิกเพื่อเพิ่มรูปภาพ ({itemImages.length}/10)</span>
                                        </div>
                                    </div>

                                    {itemImages.length > 0 && (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
                                            {itemImages.map((img, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                    <img src={img.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">ยกเลิก</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-800 transition font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting ? 'กำลังบันทึก...' : (editItem ? 'บันทึกการแก้ไข' : 'บันทึก')}
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

export default MyMarketItems;
