// Daftar perusahaan (pihak ketiga) yang terdaftar di platform.
// Halaman publik menampilkan semua lowongan dari semua perusahaan.
// HRD memilih perusahaan saat mendaftar; data yang mereka lihat dibatasi pada perusahaan tersebut.
export const COMPANIES = [
  {
    id: 1,
    name: 'NusantaraTech',
    slug: 'nusantaratech',
    email: 'hr@nusantaratech.id',
    phone: '081200000001',
    address: 'Jl. Raya Darmo No. 88, Surabaya, Jawa Timur 60265',
    description: 'Perusahaan teknologi yang membuka lowongan Frontend, Backend, Data Analyst, dan HR.',
  },
  {
    id: 2,
    name: 'TechCorp Indonesia',
    slug: 'techcorp',
    email: 'hr@techcorp.id',
    phone: '081200000002',
    address: 'Glove Tower, Jakarta Utara, DKI Jakarta',
    description: 'Perusahaan teknologi yang membuka lowongan Backend, Data Analyst, dan HR.',
  },
  {
    id: 3,
    name: 'Kreatif Desain',
    slug: 'kreatifdesain',
    email: 'hr@kreatifdesain.id',
    phone: '081200000003',
    address: 'Jl. Seni Rupa No. 12, Bandung, Jawa Barat',
    description: 'Perusahaan desain yang membuka lowongan UI/UX Designer dan Frontend.',
  },
];

// Nama perusahaan yang tampil di halaman publik (halaman utama)
export const DEFAULT_COMPANY = COMPANIES[0];
