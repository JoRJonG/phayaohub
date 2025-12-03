import React from 'react';
import { Map as MapIcon } from 'lucide-react';

const Map: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-purple-100 rounded-full text-purple-600">
                            <MapIcon size={48} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">แผนที่พะเยา</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        สำรวจสถานที่ท่องเที่ยว ร้านอาหาร และที่พักในจังหวัดพะเยาผ่านแผนที่แบบโต้ตอบ
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center h-96 flex flex-col items-center justify-center">
                    <MapIcon size={64} className="text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">กำลังพัฒนา</h2>
                    <p className="text-slate-500">ฟีเจอร์แผนที่กำลังอยู่ระหว่างการพัฒนา จะเปิดให้ใช้งานเร็วๆ นี้</p>
                </div>
            </div>
        </div>
    );
};

export default Map;
