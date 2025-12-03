export enum District {
  Muang = "เมืองพะเยา",
  ChiangKham = "เชียงคำ",
  DokKhamtai = "ดอกคำใต้",
  Chun = "จุน",
  ChiangMuan = "เชียงม่วน",
  Pong = "ปง",
  MaeChai = "แม่ใจ",
  PhuSang = "ภูซาง",
  PhuKamyao = "ภูกามยาว"
}

export interface Product {
  id: string;
  title: string;
  price: number;
  category: "OTOP" | "SecondHand" | "Food" | "Other";
  district: District;
  image: string;
  seller: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  type: "FullTime" | "PartTime" | "Freelance";
  salary: string;
  district: District;
  date: string;
}

export interface Place {
  id: string;
  name: string;
  category: "Eat" | "Travel" | "Stay";
  description: string;
  rating: number;
  image: string;
  district: District;
}

export interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  category: "General" | "News" | "Help" | "LostFound";
  likes: number;
  comments: number;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}