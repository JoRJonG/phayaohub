import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Eye, Star, Calendar, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface Guide {
    id: number;
    title: string;
    category: string;
    description?: string;
    content?: string;
    image_url?: string;
    images?: { id: number, image_url: string }[];
    is_featured: boolean;
    view_count: number;
    created_at: string;
}

const GuideDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchGuideDetail();
    }, [id]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;

            if (e.key === 'Escape') {
                setLightboxOpen(false);
            } else if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentImageIndex]);

    const fetchGuideDetail = async () => {
        try {
            const response = await fetch(`/api/guides/${id}`);
            const data = await response.json();
            if (data.success) {
                setGuide(data.data);
            }
        } catch (error) {
            console.error('Error fetching guide:', error);
        } finally {
            setIsLoading(false);
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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'เที่ยว': return 'bg-green-100 text-green-800';
            case 'พัก': return 'bg-blue-100 text-blue-800';
            case 'กิน': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'unset';
    };

    const goToNext = () => {
        if (!guide?.images) return;
        setCurrentImageIndex((prev) => (prev + 1) % guide.images!.length);
    };

    const goToPrevious = () => {
        if (!guide?.images) return;
        setCurrentImageIndex((prev) => (prev - 1 + guide.images!.length) % guide.images!.length);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-blue"></div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">ไม่พบข้อมูล</p>
                    <button onClick={() => navigate('/guide')} className="text-phayao-blue hover:underline">
                        กลับไปหน้าคู่มือ
                    </button>
                </div>
            </div>
        );
    }

    // Combine main image with additional images for gallery
    const allImages = guide.images && guide.images.length > 0
        ? guide.images.map(img => img.image_url)
        : guide.image_url
            ? [guide.image_url]
            : [];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/guide')}
                    className="flex items-center gap-2 text-slate-600 hover:text-phayao-blue mb-6 transition"
                >
                    <ArrowLeft size={20} />
                    <span>กลับ</span>
                </button>

                {/* Main Content */}
                <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Hero Image */}
                    {allImages.length > 0 && (
                        <div
                            className="w-full bg-gray-200 cursor-pointer relative"
                            onClick={() => openLightbox(0)}
                        >
                            <img
                                src={allImages[0]}
                                alt={guide.title}
                                className="w-full h-auto block"
                            />
                            {allImages.length > 1 && (
                                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                    {allImages.length} รูป
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(guide.category)}`}>
                                    {getCategoryLabel(guide.category)}
                                </span>
                                {guide.is_featured && (
                                    <span className="flex items-center gap-1 text-yellow-600 text-sm">
                                        <Star size={16} fill="currentColor" />
                                        <span>แนะนำ</span>
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold text-slate-800 mb-4">{guide.title}</h1>

                            {/* Meta Info */}
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Eye size={16} />
                                    <span>{guide.view_count} ครั้ง</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{new Date(guide.created_at).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {guide.description && (
                            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-phayao-blue rounded">
                                <p className="text-slate-700 text-lg">{guide.description}</p>
                            </div>
                        )}

                        {/* Main Content */}
                        {guide.content && (
                            <div className="prose prose-slate max-w-none">
                                <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                                    {guide.content}
                                </div>
                            </div>
                        )}

                        {/* Location Info */}
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <div className="flex items-start gap-3 text-slate-600">
                                <MapPin size={20} className="text-phayao-blue mt-1" />
                                <div>
                                    <div className="font-semibold text-slate-800 mb-1">สถานที่</div>
                                    <div>จังหวัดพะเยา</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    {allImages.length > 1 && (
                        <div className="p-8 pt-0">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ImageIcon size={20} />
                                รูปภาพทั้งหมด ({allImages.length} รูป)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {allImages.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square rounded-lg overflow-hidden cursor-pointer relative"
                                        onClick={() => openLightbox(index)}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={`${guide.title} - รูปที่ ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && allImages.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-50"
                    >
                        <X size={32} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-lg font-medium z-50 bg-black/50 px-4 py-2 rounded-full">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>

                    {/* Previous Button */}
                    {allImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-4 text-white hover:text-gray-300 transition z-50 bg-black/50 rounded-full p-2 hover:bg-black/70"
                        >
                            <ChevronLeft size={40} />
                        </button>
                    )}

                    {/* Next Button */}
                    {allImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-4 text-white hover:text-gray-300 transition z-50 bg-black/50 rounded-full p-2 hover:bg-black/70"
                        >
                            <ChevronRight size={40} />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={allImages[currentImageIndex]}
                            alt={`${guide.title} - รูปที่ ${currentImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 bg-black/50 rounded-lg">
                            {allImages.map((imageUrl, index) => (
                                <div
                                    key={index}
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                    className={`w-16 h-16 flex-shrink-0 rounded cursor-pointer border-2 transition ${index === currentImageIndex
                                        ? 'border-white scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GuideDetail;
