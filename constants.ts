import { District, Product, Job, Place, Post } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'ผ้าทอไทลื้อ ลายน้ำไหล',
    price: 1500,
    category: 'OTOP',
    district: District.ChiangKham,
    image: 'https://picsum.photos/400/300?random=1',
    seller: 'ร้านแม่บัว',
  },
  {
    id: '2',
    title: 'ปลาส้มไร้ก้าง (แพ็ค 3 ถุง)',
    price: 120,
    category: 'Food',
    district: District.Muang,
    image: 'https://picsum.photos/400/300?random=2',
    seller: 'ป้าศรี ปลาส้ม',
  },
  {
    id: '3',
    title: 'Honda Wave 110i มือสอง',
    price: 25000,
    category: 'SecondHand',
    district: District.DokKhamtai,
    image: 'https://picsum.photos/400/300?random=3',
    seller: 'คุณสมชาย',
  },
  {
    id: '4',
    title: 'ข้าวหอมมะลิพะเยา 5กก.',
    price: 200,
    category: 'OTOP',
    district: District.Chun,
    image: 'https://picsum.photos/400/300?random=4',
    seller: 'วิสาหกิจชุมชนจุน',
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'พนักงานขายหน้าร้าน',
    company: 'Phayao Gadget Store',
    type: 'FullTime',
    salary: '12,000 - 15,000',
    district: District.Muang,
    date: '2 ชม. ที่แล้ว',
  },
  {
    id: '2',
    title: 'Barista (Part-time)',
    company: 'Lake View Cafe',
    type: 'PartTime',
    salary: '50 บาท/ชม.',
    district: District.Muang,
    date: '1 วันที่แล้ว',
  },
  {
    id: '3',
    title: 'Graphic Designer',
    company: 'Freelance Project',
    type: 'Freelance',
    salary: 'ตามตกลง',
    district: District.ChiangKham,
    date: '3 วันที่แล้ว',
  },
];

export const MOCK_PLACES: Place[] = [
  {
    id: '1',
    name: 'กว๊านพะเยา',
    category: 'Travel',
    description: 'ทะเลสาบน้ำจืดขนาดใหญ่ที่สุดในภาคเหนือ จุดชมพระอาทิตย์ตกที่สวยงามที่สุด',
    rating: 4.8,
    image: 'https://picsum.photos/800/600?random=10',
    district: District.Muang,
  },
  {
    id: '2',
    name: 'วัดนันตาราม',
    category: 'Travel',
    description: 'วัดศิลปะไทใหญ่ที่งดงาม สร้างด้วยไม้สักทองทั้งหลัง',
    rating: 4.7,
    image: 'https://picsum.photos/800/600?random=11',
    district: District.ChiangKham,
  },
  {
    id: '3',
    name: 'ฮิมกว๊าน คาเฟ่',
    category: 'Eat',
    description: 'คาเฟ่บรรยากาศดีริมกว๊านพะเยา กาแฟอร่อย เค้กโฮมเมด',
    rating: 4.5,
    image: 'https://picsum.photos/800/600?random=12',
    district: District.Muang,
  },
  {
    id: '4',
    name: 'ภูลังกา รีสอร์ท',
    category: 'Stay',
    description: 'ที่พักชมทะเลหมอกยามเช้า วิวผาช้างน้อย',
    rating: 4.9,
    image: 'https://picsum.photos/800/600?random=13',
    district: District.Pong,
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'Admin',
    title: 'แจ้งข่าว: ปิดถนนเลียบกว๊านชั่วคราว เสาร์นี้',
    content: 'จะมีการจัดงานวิ่งมินิมาราธอนช่วงเช้า 05.00 - 09.00 น. โปรดหลีกเลี่ยงเส้นทาง',
    category: 'News',
    likes: 154,
    comments: 23,
    timestamp: '10:00 น.',
  },
  {
    id: '2',
    author: 'CatLover',
    title: 'ตามหาแมวหาย สีส้ม พิกัดหน้า ม.พะเยา',
    content: 'น้องชื่อถุงทอง หายไปเมื่อวานเย็น ใครพบเห็นแจ้งหน่อยครับ มีรางวัล',
    category: 'LostFound',
    likes: 45,
    comments: 12,
    timestamp: 'เมื่อวาน',
  },
  {
    id: '3',
    author: 'Traveler_01',
    title: 'แนะนำร้านลาบอร่อยๆ ในเมืองหน่อยครับ',
    content: 'อยากกินลาบเหนือแต้ๆ รบกวนคนพื้นที่แนะนำด้วยครับ',
    category: 'General',
    likes: 12,
    comments: 8,
    timestamp: '2 วันที่แล้ว',
  }
];