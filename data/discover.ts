export interface DiscoverData {
  id: string;
  name: string;
  arabicName?: string;
  title: string;
  period: string;
  description: string;
  surahs: { id: number; name: string }[];
}

export const MIRACLES_DATA: DiscoverData[] = [
  {
    id: 'spider',
    name: "The Spider's House",
    title: "Nature's Architecture",
    period: "Biology",
    description: "The Quran describes those who take protectors other than Allah as being like a spider building a house. Amazingly, modern science shows the spider's web is physically the flimsiest of houses, and female spiders (used in the Arabic grammar here) build them, often eating the male!",
    surahs: [{ id: 29, name: "Al-'Ankabut" }]
  },
  {
    id: 'iron',
    name: "Iron Sent Down",
    title: "Origins of Iron",
    period: "Astrophysics",
    description: "Allah says 'We sent down Iron, in which is great might'. Science now confirms that Iron is not native to Earth—it was formed in dying stars and literally 'sent down' to Earth via meteorites billions of years ago!",
    surahs: [{ id: 57, name: "Al-Hadid" }]
  },
  {
    id: 'ants',
    name: "Talking Ants",
    title: "Animal Communication",
    period: "Entomology",
    description: "During Prophet Sulaiman's time, an ant warned her colony: 'O ants, enter your dwellings that you not be crushed by Sulaiman'. Science recently discovered that ants do 'talk' to each other using complex chemical signals and sound frequencies!",
    surahs: [{ id: 27, name: "An-Naml" }]
  },
  {
    id: 'oceans',
    name: "The Two Seas",
    title: "Oceanic Barriers",
    period: "Oceanography",
    description: "The Quran mentions two seas meeting but there is a 'barrier between them which they do not transgress'. Oceanographers found that where different seas meet (like the Mediterranean and Atlantic), they retain their own temperature and salinity due to a physical barrier called a halocline!",
    surahs: [{ id: 55, name: "Ar-Rahman" }, { id: 25, name: "Al-Furqan" }]
  }
];

export const PARABLES_DATA: DiscoverData[] = [
  {
    id: 'cave',
    name: "The Sleepers of the Cave",
    arabicName: "أصحاب الكهف",
    title: "Youths of Unwavering Faith",
    period: "Perseverance",
    description: "A group of young men fled a tyrannical king to protect their belief in one God. They hid in a cave, and Allah miraculously put them to sleep for over 300 years, waking them up in a time when the whole city had become believers!",
    surahs: [{ id: 18, name: "Al-Kahf" }]
  },
  {
    id: 'two-gardens',
    name: "The Man with Two Gardens",
    title: "Arrogance vs Gratitude",
    period: "Humility",
    description: "A wealthy man was given two beautiful, fruitful gardens but became arrogant and forgot Allah. A poorer, humble man reminded him to say 'Masha'Allah' (As Allah willed). The arrogant man lost everything overnight, teaching us to always be grateful.",
    surahs: [{ id: 18, name: "Al-Kahf" }]
  },
  {
    id: 'luqman',
    name: "Luqman's Advice",
    title: "Wisdom for Children",
    period: "Parenting",
    description: "Luqman the Wise gave beautiful advice to his son: Don't associate partners with Allah, respect your parents, establish prayer, be patient, and never walk the earth with arrogance. It's the ultimate guide for good character!",
    surahs: [{ id: 31, name: "Luqman" }]
  },
  {
    id: 'uzair',
    name: "The Man and His Donkey",
    title: "Resurrection",
    period: "Certainty",
    description: "A man passed by a ruined town and wondered how Allah could bring it back to life. Allah caused him to die for 100 years, then woke him up. His food was completely fresh, but his donkey had turned to bones, showing Allah's power over time and life!",
    surahs: [{ id: 2, name: "Al-Baqarah" }]
  }
];
