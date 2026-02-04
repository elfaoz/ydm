export interface JuzSurahRange {
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
}

export interface JuzData {
  juz: number;
  ranges: JuzSurahRange[];
}

export const juzMapping: JuzData[] = [
  { juz: 1, ranges: [{ surahName: 'Al-Fatihah', ayahFrom: 1, ayahTo: 7 }, { surahName: 'Al-Baqarah', ayahFrom: 1, ayahTo: 141 }] },
  { juz: 2, ranges: [{ surahName: 'Al-Baqarah', ayahFrom: 142, ayahTo: 252 }] },
  { juz: 3, ranges: [{ surahName: 'Al-Baqarah', ayahFrom: 253, ayahTo: 286 }, { surahName: 'Ali Imran', ayahFrom: 1, ayahTo: 92 }] },
  { juz: 4, ranges: [{ surahName: 'Ali Imran', ayahFrom: 93, ayahTo: 200 }, { surahName: 'An-Nisa', ayahFrom: 1, ayahTo: 23 }] },
  { juz: 5, ranges: [{ surahName: 'An-Nisa', ayahFrom: 24, ayahTo: 147 }] },
  { juz: 6, ranges: [{ surahName: 'An-Nisa', ayahFrom: 148, ayahTo: 176 }, { surahName: 'Al-Maidah', ayahFrom: 1, ayahTo: 81 }] },
  { juz: 7, ranges: [{ surahName: 'Al-Maidah', ayahFrom: 82, ayahTo: 120 }, { surahName: 'Al-Anam', ayahFrom: 1, ayahTo: 110 }] },
  { juz: 8, ranges: [{ surahName: 'Al-Anam', ayahFrom: 111, ayahTo: 165 }, { surahName: 'Al-Araf', ayahFrom: 1, ayahTo: 87 }] },
  { juz: 9, ranges: [{ surahName: 'Al-Araf', ayahFrom: 88, ayahTo: 206 }, { surahName: 'Al-Anfal', ayahFrom: 1, ayahTo: 40 }] },
  { juz: 10, ranges: [{ surahName: 'Al-Anfal', ayahFrom: 41, ayahTo: 75 }, { surahName: 'At-Taubah', ayahFrom: 1, ayahTo: 92 }] },
  { juz: 11, ranges: [{ surahName: 'At-Taubah', ayahFrom: 93, ayahTo: 129 }, { surahName: 'Yunus', ayahFrom: 1, ayahTo: 109 }, { surahName: 'Hud', ayahFrom: 1, ayahTo: 5 }] },
  { juz: 12, ranges: [{ surahName: 'Hud', ayahFrom: 6, ayahTo: 123 }, { surahName: 'Yusuf', ayahFrom: 1, ayahTo: 52 }] },
  { juz: 13, ranges: [{ surahName: 'Yusuf', ayahFrom: 53, ayahTo: 111 }, { surahName: 'Ar-Rad', ayahFrom: 1, ayahTo: 43 }, { surahName: 'Ibrahim', ayahFrom: 1, ayahTo: 52 }] },
  { juz: 14, ranges: [{ surahName: 'Al-Hijr', ayahFrom: 1, ayahTo: 99 }, { surahName: 'An-Nahl', ayahFrom: 1, ayahTo: 128 }] },
  { juz: 15, ranges: [{ surahName: 'Al-Isra', ayahFrom: 1, ayahTo: 111 }, { surahName: 'Al-Kahf', ayahFrom: 1, ayahTo: 74 }] },
  { juz: 16, ranges: [{ surahName: 'Al-Kahf', ayahFrom: 75, ayahTo: 110 }, { surahName: 'Maryam', ayahFrom: 1, ayahTo: 98 }, { surahName: 'Ta-Ha', ayahFrom: 1, ayahTo: 135 }] },
  { juz: 17, ranges: [{ surahName: 'Al-Anbiya', ayahFrom: 1, ayahTo: 112 }, { surahName: 'Al-Hajj', ayahFrom: 1, ayahTo: 78 }] },
  { juz: 18, ranges: [{ surahName: 'Al-Muminun', ayahFrom: 1, ayahTo: 118 }, { surahName: 'An-Nur', ayahFrom: 1, ayahTo: 64 }, { surahName: 'Al-Furqan', ayahFrom: 1, ayahTo: 20 }] },
  { juz: 19, ranges: [{ surahName: 'Al-Furqan', ayahFrom: 21, ayahTo: 77 }, { surahName: 'Ash-Shuara', ayahFrom: 1, ayahTo: 227 }, { surahName: 'An-Naml', ayahFrom: 1, ayahTo: 55 }] },
  { juz: 20, ranges: [{ surahName: 'An-Naml', ayahFrom: 56, ayahTo: 93 }, { surahName: 'Al-Qasas', ayahFrom: 1, ayahTo: 88 }, { surahName: 'Al-Ankabut', ayahFrom: 1, ayahTo: 45 }] },
  { juz: 21, ranges: [{ surahName: 'Al-Ankabut', ayahFrom: 46, ayahTo: 69 }, { surahName: 'Ar-Rum', ayahFrom: 1, ayahTo: 60 }, { surahName: 'Luqman', ayahFrom: 1, ayahTo: 34 }, { surahName: 'As-Sajdah', ayahFrom: 1, ayahTo: 30 }, { surahName: 'Al-Ahzab', ayahFrom: 1, ayahTo: 30 }] },
  { juz: 22, ranges: [{ surahName: 'Al-Ahzab', ayahFrom: 31, ayahTo: 73 }, { surahName: 'Saba', ayahFrom: 1, ayahTo: 54 }, { surahName: 'Fatir', ayahFrom: 1, ayahTo: 45 }, { surahName: 'Ya-Sin', ayahFrom: 1, ayahTo: 27 }] },
  { juz: 23, ranges: [{ surahName: 'Ya-Sin', ayahFrom: 28, ayahTo: 83 }, { surahName: 'As-Saffat', ayahFrom: 1, ayahTo: 182 }, { surahName: 'Sad', ayahFrom: 1, ayahTo: 88 }, { surahName: 'Az-Zumar', ayahFrom: 1, ayahTo: 31 }] },
  { juz: 24, ranges: [{ surahName: 'Az-Zumar', ayahFrom: 32, ayahTo: 75 }, { surahName: 'Ghafir', ayahFrom: 1, ayahTo: 85 }, { surahName: 'Fussilat', ayahFrom: 1, ayahTo: 46 }] },
  { juz: 25, ranges: [{ surahName: 'Fussilat', ayahFrom: 47, ayahTo: 54 }, { surahName: 'Ash-Shura', ayahFrom: 1, ayahTo: 53 }, { surahName: 'Az-Zukhruf', ayahFrom: 1, ayahTo: 89 }, { surahName: 'Ad-Dukhan', ayahFrom: 1, ayahTo: 59 }, { surahName: 'Al-Jathiyah', ayahFrom: 1, ayahTo: 37 }] },
  { juz: 26, ranges: [{ surahName: 'Al-Ahqaf', ayahFrom: 1, ayahTo: 35 }, { surahName: 'Muhammad', ayahFrom: 1, ayahTo: 38 }, { surahName: 'Al-Fath', ayahFrom: 1, ayahTo: 29 }, { surahName: 'Al-Hujurat', ayahFrom: 1, ayahTo: 18 }, { surahName: 'Qaf', ayahFrom: 1, ayahTo: 45 }, { surahName: 'Adh-Dhariyat', ayahFrom: 1, ayahTo: 30 }] },
  { juz: 27, ranges: [{ surahName: 'Adh-Dhariyat', ayahFrom: 31, ayahTo: 60 }, { surahName: 'At-Tur', ayahFrom: 1, ayahTo: 49 }, { surahName: 'An-Najm', ayahFrom: 1, ayahTo: 62 }, { surahName: 'Al-Qamar', ayahFrom: 1, ayahTo: 55 }, { surahName: 'Ar-Rahman', ayahFrom: 1, ayahTo: 78 }, { surahName: 'Al-Waqiah', ayahFrom: 1, ayahTo: 96 }, { surahName: 'Al-Hadid', ayahFrom: 1, ayahTo: 29 }] },
  { juz: 28, ranges: [{ surahName: 'Al-Mujadila', ayahFrom: 1, ayahTo: 22 }, { surahName: 'Al-Hashr', ayahFrom: 1, ayahTo: 24 }, { surahName: 'Al-Mumtahanah', ayahFrom: 1, ayahTo: 13 }, { surahName: 'As-Saff', ayahFrom: 1, ayahTo: 14 }, { surahName: 'Al-Jumuah', ayahFrom: 1, ayahTo: 11 }, { surahName: 'Al-Munafiqun', ayahFrom: 1, ayahTo: 11 }, { surahName: 'At-Taghabun', ayahFrom: 1, ayahTo: 18 }, { surahName: 'At-Talaq', ayahFrom: 1, ayahTo: 12 }, { surahName: 'At-Tahrim', ayahFrom: 1, ayahTo: 12 }] },
  { juz: 29, ranges: [{ surahName: 'Al-Mulk', ayahFrom: 1, ayahTo: 30 }, { surahName: 'Al-Qalam', ayahFrom: 1, ayahTo: 52 }, { surahName: 'Al-Haqqah', ayahFrom: 1, ayahTo: 52 }, { surahName: 'Al-Maarij', ayahFrom: 1, ayahTo: 44 }, { surahName: 'Nuh', ayahFrom: 1, ayahTo: 28 }, { surahName: 'Al-Jinn', ayahFrom: 1, ayahTo: 28 }, { surahName: 'Al-Muzzammil', ayahFrom: 1, ayahTo: 20 }, { surahName: 'Al-Muddathir', ayahFrom: 1, ayahTo: 56 }, { surahName: 'Al-Qiyamah', ayahFrom: 1, ayahTo: 40 }, { surahName: 'Al-Insan', ayahFrom: 1, ayahTo: 31 }, { surahName: 'Al-Mursalat', ayahFrom: 1, ayahTo: 50 }] },
  { juz: 30, ranges: [{ surahName: 'An-Naba', ayahFrom: 1, ayahTo: 40 }, { surahName: 'An-Naziat', ayahFrom: 1, ayahTo: 46 }, { surahName: 'Abasa', ayahFrom: 1, ayahTo: 42 }, { surahName: 'At-Takwir', ayahFrom: 1, ayahTo: 29 }, { surahName: 'Al-Infitar', ayahFrom: 1, ayahTo: 19 }, { surahName: 'Al-Mutaffifin', ayahFrom: 1, ayahTo: 36 }, { surahName: 'Al-Inshiqaq', ayahFrom: 1, ayahTo: 25 }, { surahName: 'Al-Buruj', ayahFrom: 1, ayahTo: 22 }, { surahName: 'At-Tariq', ayahFrom: 1, ayahTo: 17 }, { surahName: 'Al-Ala', ayahFrom: 1, ayahTo: 19 }, { surahName: 'Al-Ghashiyah', ayahFrom: 1, ayahTo: 26 }, { surahName: 'Al-Fajr', ayahFrom: 1, ayahTo: 30 }, { surahName: 'Al-Balad', ayahFrom: 1, ayahTo: 20 }, { surahName: 'Ash-Shams', ayahFrom: 1, ayahTo: 15 }, { surahName: 'Al-Lail', ayahFrom: 1, ayahTo: 21 }, { surahName: 'Ad-Duha', ayahFrom: 1, ayahTo: 11 }, { surahName: 'Ash-Sharh', ayahFrom: 1, ayahTo: 8 }, { surahName: 'At-Tin', ayahFrom: 1, ayahTo: 8 }, { surahName: 'Al-Alaq', ayahFrom: 1, ayahTo: 19 }, { surahName: 'Al-Qadr', ayahFrom: 1, ayahTo: 5 }, { surahName: 'Al-Bayyinah', ayahFrom: 1, ayahTo: 8 }, { surahName: 'Az-Zalzalah', ayahFrom: 1, ayahTo: 8 }, { surahName: 'Al-Adiyat', ayahFrom: 1, ayahTo: 11 }, { surahName: 'Al-Qariah', ayahFrom: 1, ayahTo: 11 }, { surahName: 'At-Takathur', ayahFrom: 1, ayahTo: 8 }, { surahName: 'Al-Asr', ayahFrom: 1, ayahTo: 3 }, { surahName: 'Al-Humazah', ayahFrom: 1, ayahTo: 9 }, { surahName: 'Al-Fil', ayahFrom: 1, ayahTo: 5 }, { surahName: 'Quraish', ayahFrom: 1, ayahTo: 4 }, { surahName: 'Al-Maun', ayahFrom: 1, ayahTo: 7 }, { surahName: 'Al-Kawthar', ayahFrom: 1, ayahTo: 3 }, { surahName: 'Al-Kafirun', ayahFrom: 1, ayahTo: 6 }, { surahName: 'An-Nasr', ayahFrom: 1, ayahTo: 3 }, { surahName: 'Al-Masad', ayahFrom: 1, ayahTo: 5 }, { surahName: 'Al-Ikhlas', ayahFrom: 1, ayahTo: 4 }, { surahName: 'Al-Falaq', ayahFrom: 1, ayahTo: 5 }, { surahName: 'An-Nas', ayahFrom: 1, ayahTo: 6 }] }
];

export const getJuzData = (juzNumber: number): JuzData | undefined => {
  return juzMapping.find(juz => juz.juz === juzNumber);
};
