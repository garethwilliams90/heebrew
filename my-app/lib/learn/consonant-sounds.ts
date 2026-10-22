const letters: readonly { id: string; file: string }[] = [
  { id: "aleph", file: "01_alef_א.mp3" },
  { id: "bet", file: "03_bet_hard_בּ.mp3" },
  { id: "gimel", file: "04_gimel_ג.mp3" },
  { id: "dalet", file: "05_dalet_ד.mp3" },
  { id: "he", file: "06_he_ה.mp3" },
  { id: "vav", file: "07_vav_ו.mp3" },
  { id: "zayin", file: "08_zayin_ז.mp3" },
  { id: "chet", file: "09_het_ח.mp3" },
  { id: "tet", file: "10_tet_ט.mp3" },
  { id: "yod", file: "11_yod_י.mp3" },
  { id: "kaf", file: "13_kaf_hard_כּ.mp3" },
  { id: "lamed", file: "14_lamed_ל.mp3" },
  { id: "mem", file: "15_mem_מ.mp3" },
  { id: "nun", file: "16_nun_נ.mp3" },
  { id: "samekh", file: "17_samekh_ס.mp3" },
  { id: "ayin", file: "18_ayin_ע.mp3" },
  { id: "pe", file: "19_pe_soft_פ.mp3" },
  { id: "tsadi", file: "20_tsadi_צ.mp3" },
  { id: "kuf", file: "21_qof_ק.mp3" },
  { id: "reish", file: "22_resh_ר.mp3" },
  { id: "shin", file: "23_shin_ש.mp3" },
  { id: "tav", file: "24_tav_ת.mp3" },
];

export function consonantSrc(file: string) {
  return `/sounds/hebrew_letter_sounds_24_mp3s/${encodeURIComponent(file)}`;
}

export function letterConsonantSrc(letterId: string) {
  const file = letters.find((letter) => letter.id === letterId)?.file;
  return file ? consonantSrc(file) : null;
}
