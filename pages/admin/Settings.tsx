import React, { useState, useEffect, useRef } from 'react';
import { Save, Image as ImageIcon, Camera } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSettings: React.FC = () => {
    const [heroBg, setHeroBg] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings/hero-bg');
            const data = await response.json();
            if (data.success && data.imageUrl) {
                setHeroBg(data.imageUrl);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            let finalImageUrl = heroBg;

            // Upload new image if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('folder', 'others');

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                const uploadData = await uploadRes.json();
                if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');
                finalImageUrl = uploadData.url;
            }

            // Update Settings
            const response = await fetch('/api/settings/hero-bg', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ imageUrl: finalImageUrl })
            });

            const data = await response.json();

            if (data.success) {
                setHeroBg(finalImageUrl);
                setPreviewUrl(null);
                setSelectedFile(null);
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    text: 'อัพเดทรูปภาพพื้นหลังเรียบร้อยแล้ว',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถบันทึกข้อมูลได้'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าเว็บไซต์</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <ImageIcon size={20} className="text-phayao-blue" />
                    รูปภาพพื้นหลังหน้าแรก (Hero Banner)
                </h2>

                <div className="space-y-6">
                    <div className="relative w-full h-64 md:h-96 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 group">
                        {previewUrl || heroBg ? (
                            <img
                                src={previewUrl || heroBg}
                                alt="Hero Background"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <ImageIcon size={48} className="mb-2" />
                                <span>ไม่มีรูปภาพ</span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <div className="text-white flex flex-col items-center">
                                <Camera size={32} className="mb-2" />
                                <span className="font-medium">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                            </div>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isLoading || (!selectedFile && !previewUrl)} // Disable if no change
                            className="flex items-center gap-2 px-6 py-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save size={18} />
                            )}
                            บันทึกการเปลี่ยนแปลง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
