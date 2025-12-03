import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, DollarSign, Tag, User, Phone, MessageCircle, Calendar, Eye } from 'lucide-react';

interface MarketItem {
    id: number;
    title: string;
    description: string;
    price: number;
    condition_type: string;
    location?: string;
    contact_phone?: string;
    contact_line?: string;
    status: string;
    category_name?: string;
    seller_name?: string;
    seller_full_name?: string;
    created_at: string;
    images?: { image_url: string; is_primary: boolean }[];
    view_count: number;
}

const MarketItemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<MarketItem | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchItemDetail();
        fetchItemImages();
    }, [id]);

    const fetchItemDetail = async () => {
        try {
            const response = await fetch(`/api/market-items/${id}`);
            const data = await response.json();
            if (data.success) {
                setItem(data.data);
            }
        } catch (error) {
            console.error('Error fetching item:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchItemImages = async () => {
        try {
            const response = await fetch(`/api/market-items/${id}/images`);
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                const imageUrls = data.data.map((img: any) => img.image_url);
                setImages(imageUrls);
                setSelectedImage(imageUrls[0]);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const getConditionLabel = (condition: string) => {
        const labels: { [key: string]: string } = {
            'new': 'ใหม่',
            'like_new': 'เหมือนใหม่',
            'good': 'ดี',
            'fair': 'พอใช้'
        };
        return labels[condition] || condition;
    };

    const getConditionColor = (condition: string) => {
        const colors: { [key: string]: string } = {
            'new': 'bg-green-100 text-green-800',
            'like_new': 'bg-blue-100 text-blue-800',
            'good': 'bg-yellow-100 text-yellow-800',
            'fair': 'bg-orange-100 text-orange-800'
        };
        return colors[condition] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-blue"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">ไม่พบข้อมูลสินค้า</p>
                    <button onClick={() => navigate('/market')} className="text-phayao-blue hover:underline">
                        กลับไปหน้าตลาด
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/market')}
                    className="flex items-center gap-2 text-slate-600 hover:text-phayao-blue mb-6 transition"
                >
                    <ArrowLeft size={20} />
                    <span>กลับ</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Images Section */}
                    <div>
                        {/* Main Image */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
                            <div className="aspect-square bg-gray-200">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition ${selectedImage === img ? 'border-phayao-blue' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            {/* Category & Condition */}
                            <div className="flex items-center gap-2 mb-4">
                                {item.category_name && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                        {item.category_name}
                                    </span>
                                )}
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getConditionColor(item.condition_type)}`}>
                                    {getConditionLabel(item.condition_type)}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-slate-800 mb-4">{item.title}</h1>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="text-4xl font-bold text-phayao-gold">
                                    ฿{item.price.toLocaleString()}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6 pb-6 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-800 mb-2">รายละเอียด</h2>
                                <p className="text-slate-600 whitespace-pre-line">{item.description}</p>
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                                {item.location && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MapPin size={20} className="text-phayao-blue" />
                                        <span>{item.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-slate-600">
                                    <User size={20} className="text-phayao-blue" />
                                    <span>{item.seller_full_name || 'ผู้ใช้งาน'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Calendar size={20} className="text-phayao-blue" />
                                    <span>โพสต์เมื่อ {new Date(item.created_at).toLocaleDateString('th-TH')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Eye size={20} className="text-phayao-blue" />
                                    <span>เข้าชม {item.view_count || 0} ครั้ง</span>
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-3">ติดต่อผู้ขาย</h2>
                                <div className="space-y-2">
                                    {item.contact_phone && (
                                        <a
                                            href={`tel:${item.contact_phone}`}
                                            className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                                        >
                                            <Phone size={20} />
                                            <span>{item.contact_phone}</span>
                                        </a>
                                    )}
                                    {item.contact_line && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg">
                                            <MessageCircle size={20} />
                                            <span>LINE: {item.contact_line}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketItemDetail;
