import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
    id: string;
    text: string;
    category: 'market' | 'jobs' | 'guides' | 'community';
    icon: string;
    url: string;
}

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    onSearch?: (term: string) => void;
    showSuggestions?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'ค้นหา... งาน, ที่พัก, ของกิน',
    className = '',
    onSearch,
    showSuggestions = false
}) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Popular searches
    const popularSearches: SearchSuggestion[] = [
        { id: '1', text: 'งานพาร์ทไทม์', category: 'jobs', icon: '💼', url: '/jobs?search=พาร์ทไทม์' },
        { id: '2', text: 'คาเฟ่พะเยา', category: 'guides', icon: '☕', url: '/guide?search=คาเฟ่' },
        { id: '3', text: 'ของมือสอง', category: 'market', icon: '🛍️', url: '/market?search=มือสอง' },
        { id: '4', text: 'ที่พักพะเยา', category: 'guides', icon: '🏨', url: '/guide?search=ที่พัก' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
    useEffect(() => {
        if (!searchTerm.trim() || !showSuggestions) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Generate smart suggestions based on keywords
                const term = searchTerm.toLowerCase();
                const smartSuggestions: SearchSuggestion[] = [];

                // Job suggestions
                if (term.includes('งาน') || term.includes('job') || term.includes('สมัคร')) {
                    smartSuggestions.push({
                        id: 'job-1',
                        text: `หางาน "${searchTerm}"`,
                        category: 'jobs',
                        icon: '💼',
                        url: `/jobs?search=${encodeURIComponent(searchTerm)}`
                    });
                }

                // Market suggestions
                if (term.includes('ซื้อ') || term.includes('ขาย') || term.includes('ของ') || term.includes('มือสอง')) {
                    smartSuggestions.push({
                        id: 'market-1',
                        text: `ค้นหาสินค้า "${searchTerm}"`,
                        category: 'market',
                        icon: '🛍️',
                        url: `/market?search=${encodeURIComponent(searchTerm)}`
                    });
                }

                // Guide suggestions
                if (term.includes('ที่เที่ยว') || term.includes('คาเฟ') || term.includes('ร้านอาหาร') || term.includes('ที่พัก')) {
                    smartSuggestions.push({
                        id: 'guide-1',
                        text: `ค้นหาสถานที่ "${searchTerm}"`,
                        category: 'guides',
                        icon: '📍',
                        url: `/guide?search=${encodeURIComponent(searchTerm)}`
                    });
                }

                // Community suggestions
                if (term.includes('คุย') || term.includes('แชร์') || term.includes('โพส')) {
                    smartSuggestions.push({
                        id: 'community-1',
                        text: `ค้นหากระทู้ "${searchTerm}"`,
                        category: 'community',
                        icon: '💬',
                        url: `/community?search=${encodeURIComponent(searchTerm)}`
                    });
                }

                // If no specific category, add all
                if (smartSuggestions.length === 0) {
                    smartSuggestions.push(
                        {
                            id: 'all-market',
                            text: `ค้นหาสินค้า "${searchTerm}"`,
                            category: 'market',
                            icon: '🛍️',
                            url: `/market?search=${encodeURIComponent(searchTerm)}`
                        },
                        {
                            id: 'all-jobs',
                            text: `ค้นหางาน "${searchTerm}"`,
                            category: 'jobs',
                            icon: '💼',
                            url: `/jobs?search=${encodeURIComponent(searchTerm)}`
                        },
                        {
                            id: 'all-guides',
                            text: `ค้นหาสถานที่ "${searchTerm}"`,
                            category: 'guides',
                            icon: '📍',
                            url: `/guide?search=${encodeURIComponent(searchTerm)}`
                        }
                    );
                }

                setSuggestions(smartSuggestions);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, showSuggestions]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        if (onSearch) {
            onSearch(searchTerm);
        } else {
            // Smart search behavior with comprehensive keyword detection
            const term = searchTerm.toLowerCase();

            // Job-related keywords (comprehensive list)
            const jobKeywords = [
                // General job terms
                'งาน', 'job', 'สมัคร', 'รับสมัคร', 'หางาน', 'ตำแหน่ง', 'position', 'vacancy', 'career',
                'เงินเดือน', 'salary', 'ค่าจ้าง', 'รายได้', 'income', 'wage',
                'part time', 'full time', 'พาร์ท', 'ประจำ', 'freelance',
                'สัมภาษณ์', 'interview', 'วุฒิ', 'ประสบการณ์', 'experience',

                // Education & Teaching
                'ครู', 'teacher', 'สอน', 'อาจารย์', 'อ.', 'ผศ.', 'รศ.', 'ศ.',
                'ติวเตอร์', 'tutor', 'การศึกษา', 'education', 'โรงเรียน', 'school',
                'มหาวิทยาลัย', 'university', 'วิทยาลัย', 'college',

                // Office & Admin
                'พนักงาน', 'employee', 'staff', 'เจ้าหน้าที่', 'officer',
                'ธุรการ', 'admin', 'เลขา', 'secretary', 'ผู้ช่วย', 'assistant',
                'บัญชี', 'accountant', 'การเงิน', 'finance',

                // Sales & Marketing
                'ขาย', 'sales', 'การตลาด', 'marketing', 'ประชาสัมพันธ์', 'pr',
                'ตัวแทน', 'agent', 'นายหน้า', 'broker',

                // IT & Technology
                'โปรแกรมเมอร์', 'programmer', 'developer', 'it', 'เทคโนโลยี',
                'คอมพิวเตอร์', 'computer', 'software', 'hardware',

                // Service & Hospitality
                'บริการ', 'service', 'แม่บ้าน', 'housekeeper', 'พนักงานเสิร์ฟ', 'waiter', 'waitress',
                'พ่อครัว', 'chef', 'cook', 'แม่ครัว', 'คนขับรถ', 'driver', 'ยาม', 'security',

                // Healthcare
                'พยาบาล', 'nurse', 'แพทย์', 'doctor', 'เภสัช', 'pharmacist',
                'ทันตแพทย์', 'dentist', 'สาธารณสุข', 'health',

                // Engineering & Technical
                'วิศวกร', 'engineer', 'ช่าง', 'technician', 'mechanic',
                'ไฟฟ้า', 'electrical', 'โยธา', 'civil', 'เครื่องกล', 'mechanical',

                // Management
                'ผู้จัดการ', 'manager', 'หัวหน้า', 'supervisor', 'ผู้บริหาร', 'executive',
                'ผู้อำนวยการ', 'director', 'ceo', 'gm',

                // Other professions
                'ทนาย', 'lawyer', 'สถาปนิก', 'architect', 'ออกแบบ', 'designer',
                'ช่างภาพ', 'photographer', 'ช่างตัดผม', 'hairdresser', 'barber',
                'นักบัญชี', 'accountant', 'ผู้ตรวจสอบ', 'auditor',
                'คนงาน', 'worker', 'labor', 'แรงงาน'
            ];

            // Market-related keywords (comprehensive list)
            const marketKeywords = [
                // General market terms
                'ซื้อ', 'buy', 'ขาย', 'sell', 'ของ', 'สินค้า', 'product', 'item',
                'มือสอง', 'second hand', 'used', 'ราคา', 'price', 'บาท', 'thb',

                // Product categories
                'otop', 'ผลิตภัณฑ์', 'ของฝาก', 'souvenir', 'ของที่ระลึก',
                'เสื้อผ้า', 'clothes', 'fashion', 'รองเท้า', 'shoes',
                'กระเป๋า', 'bag', 'เครื่องประดับ', 'jewelry', 'accessories',
                'เฟอร์นิเจอร์', 'furniture', 'ของตกแต่ง', 'decoration',
                'อิเล็กทรอนิกส์', 'electronics', 'gadget', 'มือถือ', 'phone',
                'คอมพิวเตอร์', 'computer', 'laptop', 'tablet',
                'รถ', 'car', 'motorcycle', 'มอเตอร์ไซค์', 'จักรยาน', 'bike',
                'บ้าน', 'house', 'คอนโด', 'condo', 'ที่ดิน', 'land',
                'เครื่องใช้', 'appliance', 'เครื่องครัว', 'kitchen',
                'ของเล่น', 'toy', 'เกม', 'game', 'หนังสือ', 'book'
            ];

            // Guide-related keywords (comprehensive list)
            const guideKeywords = [
                // Tourism & Travel
                'ที่เที่ยว', 'tourist', 'attraction', 'ท่องเที่ยว', 'travel', 'trip',
                'แนะนำ', 'recommend', 'review', 'รีวิว',

                // Food & Dining
                'คาเฟ', 'cafe', 'coffee', 'กาแฟ', 'ร้านอาหาร', 'restaurant',
                'ร้านอาหาร', 'dining', 'อาหาร', 'food', 'กิน', 'eat',
                'บุฟเฟ่ต์', 'buffet', 'ของหวาน', 'dessert', 'เครื่องดื่ม', 'drink',
                'ก๋วยเตี๋ยว', 'noodle', 'ข้าว', 'rice', 'ส้มตำ', 'somtum',

                // Accommodation
                'ที่พัก', 'accommodation', 'hotel', 'โรงแรม', 'resort', 'รีสอร์ท',
                'homestay', 'โฮมสเตย์', 'hostel', 'guesthouse', 'เกสต์เฮ้าส์',
                'บังกะโล', 'bungalow', 'วิลล่า', 'villa',

                // Activities & Places
                'วัด', 'temple', 'พิพิธภัณฑ์', 'museum', 'สวน', 'park', 'garden',
                'ตลาด', 'market', 'ช้อปปิ้ง', 'shopping', 'mall', 'ห้าง',
                'ภูเขา', 'mountain', 'น้ำตก', 'waterfall', 'ทะเล', 'sea', 'beach', 'หาด',
                'แม่น้ำ', 'river', 'กว๊าน', 'lake', 'ทะเลสาบ',
                'ถ่ายรูป', 'photo', 'view', 'วิว', 'ชมวิว'
            ];

            // Community-related keywords
            const communityKeywords = [
                'คุย', 'chat', 'talk', 'แชร์', 'share', 'โพส', 'post',
                'กระทู้', 'thread', 'topic', 'ถาม', 'ask', 'question',
                'ตอบ', 'answer', 'reply', 'แลกเปลี่ยน', 'exchange',
                'สนทนา', 'discuss', 'discussion', 'ความคิดเห็น', 'comment',
                'ชุมชน', 'community', 'กลุ่ม', 'group', 'forum', 'board'
            ];

            // Check which category matches best
            const hasJobKeyword = jobKeywords.some(keyword => term.includes(keyword));
            const hasMarketKeyword = marketKeywords.some(keyword => term.includes(keyword));
            const hasGuideKeyword = guideKeywords.some(keyword => term.includes(keyword));
            const hasCommunityKeyword = communityKeywords.some(keyword => term.includes(keyword));

            // Navigate based on best match
            if (hasJobKeyword) {
                navigate(`/jobs?search=${encodeURIComponent(searchTerm)}`);
            } else if (hasMarketKeyword) {
                navigate(`/market?search=${encodeURIComponent(searchTerm)}`);
            } else if (hasGuideKeyword) {
                navigate(`/guide?search=${encodeURIComponent(searchTerm)}`);
            } else if (hasCommunityKeyword) {
                navigate(`/community?search=${encodeURIComponent(searchTerm)}`);
            } else {
                // Default to market if no specific category detected
                navigate(`/market?search=${encodeURIComponent(searchTerm)}`);
            }
        }

        setShowDropdown(false);
        inputRef.current?.blur();
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        navigate(suggestion.url);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const allSuggestions = searchTerm ? suggestions : popularSearches;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleSuggestionClick(allSuggestions[selectedIndex]);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'jobs': return 'text-amber-700 bg-amber-50';
            case 'market': return 'text-blue-700 bg-blue-50';
            case 'guides': return 'text-green-700 bg-green-50';
            case 'community': return 'text-purple-700 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'jobs': return 'งาน';
            case 'market': return 'ตลาด';
            case 'guides': return 'สถานที่';
            case 'community': return 'เว็บบอร์ด';
            default: return '';
        }
    };

    const displaySuggestions = searchTerm ? suggestions : popularSearches;

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <form onSubmit={handleSearch} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full py-4 pl-6 pr-12 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-phayao-gold/50 shadow-xl backdrop-blur-sm bg-white/95 transition-all duration-300"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 h-10 w-10 bg-phayao-blue rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </button>
            </form>

            {/* Suggestions Dropdown */}
            {showDropdown && showSuggestions && displaySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                    <div className="max-h-80 overflow-y-auto">
                        {displaySuggestions.map((suggestion, index) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${selectedIndex === index ? 'bg-slate-100' : ''
                                    }`}
                            >
                                <span className="text-2xl">{suggestion.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{suggestion.text}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(suggestion.category)}`}>
                                    {getCategoryLabel(suggestion.category)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
