import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map as MapIcon, Navigation, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGuides } from '../services/api';

// Fix for Leaflet default icon not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GuideLocation {
    id: number;
    title: string;
    category: string;
    latitude: number;
    longitude: number;
    description?: string;
    image_url?: string;
}

const MapPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'เที่ยว' | 'กิน' | 'พัก'>('all');
    const [locations, setLocations] = useState<GuideLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLocations();
    }, [selectedCategory]);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            let params = 'limit=100'; // Get enough items
            if (selectedCategory !== 'all') {
                params += `&category=${selectedCategory}`;
            }

            const response = await getGuides(params);
            if (response.success) {
                // Filter only guides with valid coordinates
                const validLocations = response.data.filter((guide: any) =>
                    guide.latitude && guide.longitude &&
                    !isNaN(parseFloat(guide.latitude)) && !isNaN(parseFloat(guide.longitude))
                ).map((guide: any) => ({
                    id: guide.id,
                    title: guide.title,
                    category: guide.category,
                    latitude: parseFloat(guide.latitude),
                    longitude: parseFloat(guide.longitude),
                    description: guide.description,
                    image_url: guide.image_url
                }));
                setLocations(validLocations);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'เที่ยว': return 'text-green-600 bg-green-100';
            case 'กิน': return 'text-amber-600 bg-amber-100';
            case 'พัก': return 'text-blue-600 bg-blue-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'เที่ยว': return 'ที่เที่ยว';
            case 'กิน': return 'ร้านอาหาร';
            case 'พัก': return 'ที่พัก';
            default: return category;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm py-4 px-4 sm:px-6 lg:px-8 z-10">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <MapIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">แผนที่พะเยา</h1>
                            <p className="text-xs text-slate-500">สำรวจที่กิน เที่ยว พัก ในพะเยา</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-white text-purple-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            ทั้งหมด
                        </button>
                        <button
                            onClick={() => setSelectedCategory('เที่ยว')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-all whitespace-nowrap ${selectedCategory === 'เที่ยว' ? 'bg-white text-green-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            ที่เที่ยว
                        </button>
                        <button
                            onClick={() => setSelectedCategory('กิน')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-all whitespace-nowrap ${selectedCategory === 'กิน' ? 'bg-white text-amber-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            ร้านอาหาร
                        </button>
                        <button
                            onClick={() => setSelectedCategory('พัก')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-all whitespace-nowrap ${selectedCategory === 'พัก' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            ที่พัก
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-grow relative z-0">
                <MapContainer
                    center={[19.1667, 99.9000]}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                    style={{ height: 'calc(100vh - 200px)', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {locations.map((loc) => (
                        <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                            <Popup className="custom-popup">
                                <div className="min-w-[200px]">
                                    {loc.image_url && (
                                        <img src={loc.image_url} alt={loc.title} className="w-full h-32 object-cover rounded-t-lg mb-2" />
                                    )}
                                    <h3 className="font-bold text-slate-800 text-sm">{loc.title}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mb-1 ${getCategoryColor(loc.category)}`}>
                                        {getCategoryLabel(loc.category)}
                                    </span>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{loc.description}</p>
                                    <Link to={`/guide/${loc.id}`} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                                        ดูรายละเอียด <Navigation size={10} />
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span className="text-sm font-medium text-slate-700">กำลังโหลด...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;
