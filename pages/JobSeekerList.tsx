import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, MapPin, Briefcase, GraduationCap, User, Eye, X, ExternalLink } from 'lucide-react';

interface JobProfile {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    experience: string;
    education: string;
    skills: string;
    resume_url: string;
    photo_url?: string;
    view_count?: number;
    created_at: string;
    avatar_url?: string;
}

const JobSeekerList = () => {
    const [profiles, setProfiles] = useState<JobProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfile, setSelectedProfile] = useState<JobProfile | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await fetch('/api/job-profiles');
            const data = await res.json();
            if (data.success) {
                setProfiles(data.data);
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = async (profile: JobProfile) => {
        setSelectedProfile(profile);
        setShowModal(true);

        // Increment view count
        try {
            await fetch(`/api/job-profiles/${profile.id}/view`, { method: 'POST' });
            // Update local state to reflect new view count immediately
            setProfiles(prev => prev.map(p =>
                p.id === profile.id ? { ...p, view_count: (p.view_count || 0) + 1 } : p
            ));
            setSelectedProfile(prev => prev ? { ...prev, view_count: (prev.view_count || 0) + 1 } : null);
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    };

    const filteredProfiles = profiles.filter(profile =>
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.experience.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isPdf = (url: string) => url.toLowerCase().endsWith('.pdf');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">คนหางาน</h1>
                    <p className="text-gray-600">ค้นหาผู้สมัครงานที่มีคุณสมบัติตรงใจคุณ</p>
                </div>
                <Link
                    to="/user/deposit-resume"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                >
                    <FileText size={20} />
                    ฝากประวัติ
                </Link>
            </div>

            <div className="mb-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="ค้นหาจากชื่อ, ทักษะ, หรือประสบการณ์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfiles.map(profile => (
                        <div key={profile.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {profile.photo_url ? (
                                            <img
                                                src={profile.photo_url}
                                                alt={profile.full_name}
                                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                                {profile.full_name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{profile.full_name}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600">
                                    {profile.skills && (
                                        <div className="flex gap-2 items-start">
                                            <div className="mt-1 min-w-[16px]"><Briefcase size={16} className="text-blue-500" /></div>
                                            <p className="line-clamp-2"><span className="font-medium text-gray-700">ทักษะ:</span> {profile.skills}</p>
                                        </div>
                                    )}
                                    {profile.experience && (
                                        <div className="flex gap-2 items-start">
                                            <div className="mt-1 min-w-[16px]"><Briefcase size={16} className="text-green-500" /></div>
                                            <p className="line-clamp-2"><span className="font-medium text-gray-700">ประสบการณ์:</span> {profile.experience}</p>
                                        </div>
                                    )}
                                    {profile.education && (
                                        <div className="flex gap-2 items-start">
                                            <div className="mt-1 min-w-[16px]"><GraduationCap size={16} className="text-purple-500" /></div>
                                            <p className="line-clamp-1"><span className="font-medium text-gray-700">การศึกษา:</span> {profile.education}</p>
                                        </div>
                                    )}
                                    {profile.address && (
                                        <div className="flex gap-2 items-start">
                                            <div className="mt-1 min-w-[16px]"><MapPin size={16} className="text-red-500" /></div>
                                            <p className="line-clamp-1">{profile.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {new Date(profile.created_at).toLocaleDateString('th-TH')}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    <Eye size={12} /> {profile.view_count || 0}
                                </div>
                                <button
                                    onClick={() => handleViewProfile(profile)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 hover:underline ml-auto"
                                >
                                    <Eye size={16} /> ดูรายละเอียด
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredProfiles.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <User size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">ไม่พบข้อมูลผู้สมัครงาน</h3>
                            <p className="text-gray-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเป็นคนแรกที่ฝากประวัติ</p>
                            <Link to="/user/deposit-resume" className="mt-4 inline-block text-blue-600 hover:underline">
                                ฝากประวัติทันที
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {showModal && selectedProfile && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-4">
                                {selectedProfile.avatar_url ? (
                                    <img
                                        src={selectedProfile.avatar_url}
                                        alt={selectedProfile.full_name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl border-4 border-white shadow-md">
                                        {selectedProfile.full_name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedProfile.full_name}</h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span>{selectedProfile.email}</span>
                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                                            <Eye size={12} /> {selectedProfile.view_count || 0} ครั้ง
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm hover:shadow transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-8">
                            {/* Profile Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <User size={18} className="text-blue-500" /> ข้อมูลส่วนตัว
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {selectedProfile.photo_url && (
                                            <div className="mb-4">
                                                <img
                                                    src={selectedProfile.photo_url}
                                                    alt={selectedProfile.full_name}
                                                    className="w-32 h-40 rounded-lg object-cover shadow-md border border-slate-200 mx-auto md:mx-0"
                                                />
                                            </div>
                                        )}
                                        <p><span className="font-medium text-slate-600">ชื่อ-นามสกุล:</span> {selectedProfile.full_name}</p>
                                        <p><span className="font-medium text-slate-600">เบอร์โทรศัพท์:</span> {selectedProfile.phone || '-'}</p>
                                        <p><span className="font-medium text-slate-600">ที่อยู่:</span> {selectedProfile.address || '-'}</p>
                                        <p><span className="font-medium text-slate-600">วันที่ลงประกาศ:</span> {new Date(selectedProfile.created_at).toLocaleDateString('th-TH')}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <Briefcase size={18} className="text-green-500" /> ทักษะและประสบการณ์
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="font-medium text-slate-600 block mb-1">ทักษะ:</span>
                                            <p className="bg-slate-50 p-2 rounded border border-slate-100">{selectedProfile.skills || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-600 block mb-1">ประสบการณ์:</span>
                                            <p className="bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-line">{selectedProfile.experience || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Education */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                    <GraduationCap size={18} className="text-purple-500" /> การศึกษา
                                </h3>
                                <p className="text-sm bg-slate-50 p-3 rounded border border-slate-100">{selectedProfile.education || '-'}</p>
                            </div>

                            {/* Resume Preview */}
                            {selectedProfile.resume_url && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <FileText size={18} className="text-red-500" /> เรซูเม่ / CV
                                        </h3>
                                        <a
                                            href={selectedProfile.resume_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 hover:underline"
                                        >
                                            <ExternalLink size={14} /> เปิดในหน้าต่างใหม่
                                        </a>
                                    </div>

                                    <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 min-h-[400px] flex items-center justify-center">
                                        {isPdf(selectedProfile.resume_url) ? (
                                            <iframe
                                                src={`${selectedProfile.resume_url}#toolbar=0`}
                                                className="w-full h-[600px]"
                                                title="Resume Preview"
                                            />
                                        ) : (
                                            <img
                                                src={selectedProfile.resume_url}
                                                alt="Resume"
                                                className="max-w-full max-h-[600px] object-contain"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerList;
