import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, Save, AlertCircle, Plus, Edit, Trash2, Briefcase, MapPin, GraduationCap, User, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';

const JobProfileForm = () => {
    const { user, token, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // UI States
    const [loading, setLoading] = useState(false); // For fetching
    const [submitting, setSubmitting] = useState(false); // For saving
    const [showModal, setShowModal] = useState(false);

    // Data States
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        experience: '',
        education: '',
        skills: '',
        resume_url: '',
        photo_url: ''
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', { state: { from: location } });
        }
    }, [authLoading, user, navigate, location]);

    // Fetch profile on load
    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/job-profiles/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
            } else {
                setProfile(null);
            }
        } catch (err) {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                experience: profile.experience || '',
                education: profile.education || '',
                skills: profile.skills || '',
                resume_url: profile.resume_url || '',
                photo_url: profile.photo_url || ''
            });
        } else {
            setFormData({
                full_name: user?.full_name || '',
                email: user?.email || '',
                phone: '',
                address: '',
                experience: '',
                education: '',
                skills: '',
                resume_url: '',
                photo_url: ''
            });
        }
        setResumeFile(null);
        setPhotoFile(null);
        setShowModal(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let resumeUrl = formData.resume_url;

            if (resumeFile) {
                const uploadData = new FormData();
                uploadData.append('file', resumeFile);
                uploadData.append('folder', 'users');

                const uploadRes = await fetch('/api/upload/single', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: uploadData
                });

                const uploadResult = await uploadRes.json();
                if (uploadResult.success) {
                    resumeUrl = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error || 'Upload failed');
                }
            }

            let photoUrl = formData.photo_url;
            if (photoFile) {
                const uploadData = new FormData();
                uploadData.append('file', photoFile);
                uploadData.append('folder', 'users');

                const uploadRes = await fetch('/api/upload/single', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: uploadData
                });

                const uploadResult = await uploadRes.json();
                if (uploadResult.success) {
                    photoUrl = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error || 'Photo upload failed');
                }
            }

            const payload = { ...formData, resume_url: resumeUrl, photo_url: photoUrl };
            let res;

            if (profile) {
                res = await fetch(`/api/job-profiles/${profile.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/job-profiles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
                timer: 1500,
                showConfirmButton: false
            });

            setShowModal(false);
            fetchProfile();
        } catch (err: any) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!profile) return;

        const result = await Swal.fire({
            title: 'แน่ใจหรือไม่?',
            text: "การลบประวัติจะไม่สามารถกู้คืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/job-profiles/${profile.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    Swal.fire('ลบสำเร็จ!', 'ประวัติถูกลบแล้ว', 'success');
                    setProfile(null);
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">ฝากประวัติงาน</h1>
                    <p className="text-slate-500">จัดการข้อมูลประวัติการทำงานของคุณ</p>
                </div>
                {!profile && (
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 bg-phayao-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
                    >
                        <Plus size={20} />
                        <span>ฝากประวัติ</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
                ) : !profile ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <FileText size={48} className="text-slate-300 mb-4" />
                        <p>คุณยังไม่มีประวัติที่ฝากไว้</p>
                        <button onClick={handleOpenModal} className="mt-4 text-phayao-blue hover:underline">
                            เริ่มฝากประวัติของคุณ
                        </button>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    {profile.photo_url ? (
                                        <img
                                            src={profile.photo_url}
                                            alt={profile.full_name}
                                            className="w-16 h-16 rounded-full object-cover border border-slate-200"
                                        />
                                    ) : profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.full_name}
                                            className="w-16 h-16 rounded-full object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                                            {profile.full_name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{profile.full_name}</h2>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                            <User size={14} />
                                            <span>{profile.email}</span>
                                            {profile.phone && (
                                                <>
                                                    <span className="mx-1">•</span>
                                                    <span>{profile.phone}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    {profile.address && (
                                        <div className="flex gap-2">
                                            <MapPin size={18} className="text-gray-400 mt-0.5" />
                                            <div>
                                                <span className="font-medium text-gray-700 block">ที่อยู่</span>
                                                <p className="text-gray-600 text-sm">{profile.address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.education && (
                                        <div className="flex gap-2">
                                            <GraduationCap size={18} className="text-gray-400 mt-0.5" />
                                            <div>
                                                <span className="font-medium text-gray-700 block">การศึกษา</span>
                                                <p className="text-gray-600 text-sm">{profile.education}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.experience && (
                                        <div className="flex gap-2 md:col-span-2">
                                            <Briefcase size={18} className="text-gray-400 mt-0.5" />
                                            <div>
                                                <span className="font-medium text-gray-700 block">ประสบการณ์</span>
                                                <p className="text-gray-600 text-sm whitespace-pre-line">{profile.experience}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.skills && (
                                        <div className="flex gap-2 md:col-span-2">
                                            <div className="mt-0.5"><FileText size={18} className="text-gray-400" /></div>
                                            <div>
                                                <span className="font-medium text-gray-700 block">ทักษะ</span>
                                                <p className="text-gray-600 text-sm">{profile.skills}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {profile.resume_url && (
                                    <div className="pt-4 border-t border-gray-100 mt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                                <FileText size={18} className="text-red-500" /> เรซูเม่ / CV
                                            </h3>
                                            <a
                                                href={profile.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 hover:underline"
                                            >
                                                <ExternalLink size={14} /> เปิดในหน้าต่างใหม่
                                            </a>
                                        </div>
                                        <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 min-h-[400px] flex items-center justify-center">
                                            {profile.resume_url.toLowerCase().endsWith('.pdf') ? (
                                                <iframe
                                                    src={`${profile.resume_url}#toolbar=0`}
                                                    className="w-full h-[600px]"
                                                    title="Resume Preview"
                                                />
                                            ) : (
                                                <img
                                                    src={profile.resume_url}
                                                    alt="Resume"
                                                    className="max-w-full max-h-[600px] object-contain"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 self-end md:self-start">
                                <button
                                    onClick={handleOpenModal}
                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                    title="แก้ไข"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                                    title="ลบ"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">{profile ? 'แก้ไขประวัติ' : 'ฝากประวัติใหม่'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 flex justify-center mb-4">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                                                {photoFile ? (
                                                    <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                                                ) : formData.photo_url ? (
                                                    <img src={formData.photo_url} alt="Current" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={48} className="text-slate-300" />
                                                )}
                                            </div>
                                            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-50 border border-slate-200" title="อัพโหลดรูปถ่ายสำหรับสมัครงาน">
                                                <Upload size={16} className="text-slate-600" />
                                                <input id="photo-upload" type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ประสบการณ์การทำงาน</label>
                                    <textarea
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="ระบุบริษัท ตำแหน่ง และระยะเวลา..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">การศึกษา</label>
                                    <textarea
                                        name="education"
                                        value={formData.education}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="ระบุสถาบัน วุฒิการศึกษา..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ทักษะ (Skills)</label>
                                    <textarea
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="เช่น JavaScript, React, SQL, ภาษาอังกฤษ..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">อัพโหลด Resume / CV (PDF หรือ รูปภาพ)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label htmlFor="resume-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>อัพโหลดไฟล์</span>
                                                    <input id="resume-upload" name="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,image/*" />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                            {resumeFile && (
                                                <p className="text-sm text-green-600 font-medium mt-2">
                                                    เลือกไฟล์: {resumeFile.name}
                                                </p>
                                            )}
                                            {formData.resume_url && !resumeFile && (
                                                <div className="mt-2">
                                                    <a
                                                        href={formData.resume_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-phayao-blue hover:underline text-sm flex items-center justify-center gap-1 font-medium"
                                                    >
                                                        <FileText size={16} />
                                                        ดูไฟล์เดิมที่อัพโหลดไว้
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-800 transition font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'กำลังบันทึก...' : (profile ? 'บันทึกการแก้ไข' : 'บันทึก')}
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

export default JobProfileForm;
