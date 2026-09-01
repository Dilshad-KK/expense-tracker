export interface ProphetData {
  id: string;
  name: string;
  arabicName: string;
  title: string;
  period: string;
  description: string;
  surahs: { id: number; name: string }[];
  color: string;
}

export const PROPHETS_DATA: ProphetData[] = [
  {
    id: 'adam',
    name: 'Adam',
    arabicName: 'آدم',
    title: 'The First Human',
    period: 'Creation',
    description: 'The first prophet and first human being created by Allah. He was taught the names of all things and made the vicegerent on earth.',
    surahs: [{ id: 2, name: 'Al-Baqarah' }, { id: 7, name: "Al-A'raf" }, { id: 20, name: 'Taha' }],
    color: 'from-amber-400 to-amber-600'
  },
  {
    id: 'nuh',
    name: 'Nuh',
    arabicName: 'نوح',
    title: 'The Thankful Servant',
    period: 'The Great Flood',
    description: 'Preached to his people for 950 years, warning them of polytheism. He was instructed to build the Ark to survive the Great Flood.',
    surahs: [{ id: 11, name: 'Hud' }, { id: 71, name: 'Nuh' }, { id: 54, name: 'Al-Qamar' }],
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'ibrahim',
    name: 'Ibrahim',
    arabicName: 'إبراهيم',
    title: 'Khalilullah (Friend of Allah)',
    period: 'The Patriarch',
    description: 'Known for his unwavering faith and pure monotheism. He rebuilt the Kaaba with his son Ismail and established the rites of Hajj.',
    surahs: [{ id: 14, name: 'Ibrahim' }, { id: 21, name: 'Al-Anbiya' }, { id: 37, name: 'As-Saffat' }],
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'yusuf',
    name: 'Yusuf',
    arabicName: 'يوسف',
    title: 'The Truthful',
    period: 'Egypt',
    description: 'Endowed with immense beauty and the ability to interpret dreams. His story is described as the "most beautiful of stories" in the Quran.',
    surahs: [{ id: 12, name: 'Yusuf' }],
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'musa',
    name: 'Musa',
    arabicName: 'موسى',
    title: 'Kalimullah (He who spoke to Allah)',
    period: 'Exodus',
    description: 'The most frequently mentioned prophet in the Quran. He led the Israelites out of Egypt and received the Torah.',
    surahs: [{ id: 28, name: 'Al-Qasas' }, { id: 20, name: 'Taha' }, { id: 26, name: "Ash-Shu'ara" }],
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'isa',
    name: 'Isa',
    arabicName: 'عيسى',
    title: 'Ruhullah (Spirit of Allah)',
    period: 'Roman Era',
    description: "Born miraculously to Maryam (Mary) without a father. He performed many miracles by Allah's permission and received the Injeel (Gospel).",
    surahs: [{ id: 3, name: "Ali 'Imran" }, { id: 5, name: "Al-Ma'idah" }, { id: 19, name: 'Maryam' }],
    color: 'from-teal-400 to-teal-600'
  },
  {
    id: 'muhammad',
    name: 'Muhammad',
    arabicName: 'محمد',
    title: 'Khatam an-Nabiyyin (Seal of the Prophets)',
    period: 'Final Revelation',
    description: 'The final messenger sent to all of mankind. He received the Quran, the final and perfectly preserved revelation from Allah.',
    surahs: [{ id: 47, name: 'Muhammad' }, { id: 48, name: 'Al-Fath' }, { id: 33, name: 'Al-Ahzab' }],
    color: 'from-emerald-400 to-emerald-600'
  }
];
