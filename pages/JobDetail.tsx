import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, DollarSign, Building2, Mail, Phone, MessageCircle, Eye } from 'lucide-react';

interface Job {
    id: number;
    title: string;
    company_name: string;
    description: string;
    job_type: string;
    salary_min?: number;
    salary_max?: number;
    salary_type?: string;
    location?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_line?: string;
    requirements?: string;
    benefits?: string;
    created_at: string;
    view_count: number;
}

const JobDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchJobDetail();
    }, [id]);

    const fetchJobDetail = async () => {
        try {
            const response = await fetch(`/api/jobs/${id}`);
            const data = await response.json();
            if (data.success) {
                setJob(data.data);
            }
        } catch (error) {
            console.error('Error fetching job:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getJobTypeLabel = (jobType: string) => {
        const labels: { [key: string]: string } = {
            'full_time': 'งานประจำ',
            'part_time': 'พาร์ทไทม์',
            'freelance': 'ฟรีแลนซ์',
            'contract': 'สัญญาจ้าง',
            'internship': 'ฝึกงาน'
        };
        return labels[jobType] || jobType;
    };

    const formatSalary = () => {
        if (!job) return 'ตามตกลง';
        if (job.salary_min && job.salary_max) {
            return `฿${job.salary_min.toLocaleString()} - ฿${job.salary_max.toLocaleString()}`;
        } else if (job.salary_min) {
            return `฿${job.salary_min.toLocaleString()}+`;
        }
        return 'ตามตกลง';
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'เมื่อสักครู่';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
        return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-blue"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">ไม่พบข้อมูลงาน</p>
                    <button onClick={() => navigate('/jobs')} className="text-phayao-blue hover:underline">
                        กลับไปหน้างาน
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header Banner */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="flex items-center gap-2 text-slate-500 hover:text-phayao-blue mb-6 transition text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        <span>กลับไปหน้ารวมงาน</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                                <Building2 className="text-slate-400" size={40} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                                <div className="flex items-center gap-2 text-slate-600 font-medium text-lg mb-4">
                                    <span>{job.company_name}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <Briefcase size={14} />
                                        {getJobTypeLabel(job.job_type)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                                        <MapPin size={14} />
                                        {job.location || 'ไม่ระบุ'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                        <DollarSign size={14} />
                                        {formatSalary()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">

                            <div className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                                <Clock size={12} />
                                โพสต์เมื่อ {getTimeAgo(job.created_at)}
                            </div>
                            <div className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                                <Eye size={12} />
                                เข้าชม {job.view_count || 0} ครั้ง
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <section className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-phayao-blue rounded-full"></div>
                                รายละเอียดงาน
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                {job.description}
                            </div>
                        </section>

                        {/* Requirements */}
                        {job.requirements && (
                            <section className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-phayao-blue rounded-full"></div>
                                    คุณสมบัติผู้สมัคร
                                </h2>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                    {job.requirements}
                                </div>
                            </section>
                        )}

                        {/* Benefits */}
                        {job.benefits && (
                            <section className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-phayao-blue rounded-full"></div>
                                    สวัสดิการ
                                </h2>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                    {job.benefits}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">ข้อมูลติดต่อ</h3>
                            <div className="space-y-4">
                                {job.contact_phone && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-phayao-blue">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-0.5">เบอร์โทรศัพท์</div>
                                            <a href={`tel:${job.contact_phone}`} className="text-slate-700 font-medium hover:text-phayao-blue transition">
                                                {job.contact_phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {job.contact_email && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-phayao-blue">
                                            <Mail size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-0.5">อีเมล</div>
                                            <a href={`mailto:${job.contact_email}`} className="text-slate-700 font-medium hover:text-phayao-blue transition break-all">
                                                {job.contact_email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {job.contact_line && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 text-green-600">
                                            <MessageCircle size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-0.5">Line ID</div>
                                            <div className="text-slate-700 font-medium">
                                                {job.contact_line}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="text-xs text-slate-400 text-center">
                                    สนใจสมัครงานนี้? ติดต่อตามช่องทางด้านบนได้เลย
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
