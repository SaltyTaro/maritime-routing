/**
 * @module @arcnautical/maritime-routing/ports
 *
 * Comprehensive database of major commercial ports worldwide with
 * UN/LOCODE codes, coordinates, port types, and ocean region classification.
 *
 * Self-contained — zero external imports.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PortType = 'container' | 'bulk' | 'tanker' | 'lng' | 'naval' | 'mixed' | 'general';

export type OceanRegion =
  | 'pacific'
  | 'south_china_sea'
  | 'indian_ocean'
  | 'persian_gulf'
  | 'red_sea'
  | 'mediterranean'
  | 'atlantic_north'
  | 'atlantic_south'
  | 'caribbean'
  | 'baltic'
  | 'black_sea'
  | 'arctic'
  | 'southeast_asia'
  | 'north_sea'
  | 'oceania'
  | 'east_pacific';

/**
 * A port record following the UN/LOCODE standard (ISO 3166-1 + 3-letter location).
 *
 * Each entry carries geographic coordinates, a {@link PortType} classification,
 * and an {@link OceanRegion} tag used for regional filtering and route planning.
 */
export interface Port {
  locode: string;       // UN/LOCODE e.g., "SGSIN"
  name: string;
  country: string;
  countryCode: string;  // ISO 3166-1 alpha-2
  lat: number;
  lon: number;
  portType: PortType;
  region: OceanRegion;
}

// ---------------------------------------------------------------------------
// Port Data
// ---------------------------------------------------------------------------

export const PORTS: Port[] = [
  // =========================================================================
  // ASIA-PACIFIC (~200 ports)
  // =========================================================================

  // --- China ---
  { locode: 'CNSHA', name: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.23, lon: 121.47, portType: 'container', region: 'pacific' },
  { locode: 'CNSZX', name: 'Shenzhen', country: 'China', countryCode: 'CN', lat: 22.52, lon: 114.05, portType: 'container', region: 'south_china_sea' },
  { locode: 'CNNGB', name: 'Ningbo-Zhoushan', country: 'China', countryCode: 'CN', lat: 29.87, lon: 121.55, portType: 'mixed', region: 'pacific' },
  { locode: 'CNGUA', name: 'Guangzhou', country: 'China', countryCode: 'CN', lat: 23.08, lon: 113.24, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'CNQIN', name: 'Qingdao', country: 'China', countryCode: 'CN', lat: 36.07, lon: 120.31, portType: 'mixed', region: 'pacific' },
  { locode: 'CNTJN', name: 'Tianjin', country: 'China', countryCode: 'CN', lat: 38.99, lon: 117.70, portType: 'mixed', region: 'pacific' },
  { locode: 'CNDLC', name: 'Dalian', country: 'China', countryCode: 'CN', lat: 38.92, lon: 121.63, portType: 'mixed', region: 'pacific' },
  { locode: 'CNXMN', name: 'Xiamen', country: 'China', countryCode: 'CN', lat: 24.45, lon: 118.08, portType: 'container', region: 'south_china_sea' },
  { locode: 'CNLYG', name: 'Lianyungang', country: 'China', countryCode: 'CN', lat: 34.74, lon: 119.45, portType: 'mixed', region: 'pacific' },
  { locode: 'CNFOC', name: 'Fuzhou', country: 'China', countryCode: 'CN', lat: 26.06, lon: 119.31, portType: 'container', region: 'south_china_sea' },
  { locode: 'CNYTN', name: 'Yantian', country: 'China', countryCode: 'CN', lat: 22.57, lon: 114.27, portType: 'container', region: 'south_china_sea' },
  { locode: 'CNZSN', name: 'Zhongshan', country: 'China', countryCode: 'CN', lat: 22.52, lon: 113.39, portType: 'general', region: 'south_china_sea' },
  { locode: 'CNZHA', name: 'Zhanjiang', country: 'China', countryCode: 'CN', lat: 21.20, lon: 110.40, portType: 'naval', region: 'south_china_sea' },
  { locode: 'CNHAK', name: 'Haikou', country: 'China', countryCode: 'CN', lat: 20.02, lon: 110.35, portType: 'general', region: 'south_china_sea' },
  { locode: 'CNYIK', name: 'Yingkou', country: 'China', countryCode: 'CN', lat: 40.67, lon: 122.23, portType: 'mixed', region: 'pacific' },
  { locode: 'CNRZH', name: 'Rizhao', country: 'China', countryCode: 'CN', lat: 35.38, lon: 119.53, portType: 'bulk', region: 'pacific' },
  { locode: 'CNTAO', name: 'Tangshan', country: 'China', countryCode: 'CN', lat: 39.22, lon: 118.98, portType: 'bulk', region: 'pacific' },
  { locode: 'CNNTG', name: 'Nantong', country: 'China', countryCode: 'CN', lat: 31.98, lon: 120.88, portType: 'mixed', region: 'pacific' },
  { locode: 'CNTXG', name: 'Taixing', country: 'China', countryCode: 'CN', lat: 32.17, lon: 120.01, portType: 'general', region: 'pacific' },
  { locode: 'CNWNZ', name: 'Wenzhou', country: 'China', countryCode: 'CN', lat: 27.99, lon: 120.70, portType: 'general', region: 'pacific' },
  { locode: 'CNZJG', name: 'Zhangjiagang', country: 'China', countryCode: 'CN', lat: 31.86, lon: 120.56, portType: 'bulk', region: 'pacific' },
  { locode: 'CNHUA', name: 'Huanghua', country: 'China', countryCode: 'CN', lat: 38.37, lon: 117.35, portType: 'bulk', region: 'pacific' },
  { locode: 'CNQZH', name: 'Quanzhou', country: 'China', countryCode: 'CN', lat: 24.91, lon: 118.59, portType: 'general', region: 'south_china_sea' },
  { locode: 'CNSHK', name: 'Shekou', country: 'China', countryCode: 'CN', lat: 22.48, lon: 113.90, portType: 'container', region: 'south_china_sea' },
  { locode: 'CNJIU', name: 'Jiujiang', country: 'China', countryCode: 'CN', lat: 29.71, lon: 116.00, portType: 'general', region: 'pacific' },
  { locode: 'CNZUH', name: 'Zhuhai', country: 'China', countryCode: 'CN', lat: 22.27, lon: 113.58, portType: 'general', region: 'south_china_sea' },
  { locode: 'CNHKG', name: 'Hong Kong', country: 'China (SAR)', countryCode: 'HK', lat: 22.29, lon: 114.15, portType: 'container', region: 'south_china_sea' },
  { locode: 'CNYUL', name: 'Yulin Naval Base', country: 'China', countryCode: 'CN', lat: 18.23, lon: 109.52, portType: 'naval', region: 'south_china_sea' },
  { locode: 'CNFAN', name: 'Fangchenggang', country: 'China', countryCode: 'CN', lat: 21.69, lon: 108.35, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'CNQZJ', name: 'Quzhou', country: 'China', countryCode: 'CN', lat: 28.97, lon: 118.87, portType: 'general', region: 'pacific' },

  // --- Japan ---
  { locode: 'JPTYO', name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.65, lon: 139.77, portType: 'container', region: 'pacific' },
  { locode: 'JPYOK', name: 'Yokohama', country: 'Japan', countryCode: 'JP', lat: 35.44, lon: 139.64, portType: 'container', region: 'pacific' },
  { locode: 'JPNGO', name: 'Nagoya', country: 'Japan', countryCode: 'JP', lat: 35.05, lon: 136.88, portType: 'mixed', region: 'pacific' },
  { locode: 'JPUKB', name: 'Kobe', country: 'Japan', countryCode: 'JP', lat: 34.68, lon: 135.19, portType: 'container', region: 'pacific' },
  { locode: 'JPOSA', name: 'Osaka', country: 'Japan', countryCode: 'JP', lat: 34.65, lon: 135.43, portType: 'container', region: 'pacific' },
  { locode: 'JPKIT', name: 'Kitakyushu', country: 'Japan', countryCode: 'JP', lat: 33.95, lon: 130.95, portType: 'mixed', region: 'pacific' },
  { locode: 'JPHKT', name: 'Hakata', country: 'Japan', countryCode: 'JP', lat: 33.60, lon: 130.40, portType: 'container', region: 'pacific' },
  { locode: 'JPCHB', name: 'Chiba', country: 'Japan', countryCode: 'JP', lat: 35.57, lon: 140.10, portType: 'mixed', region: 'pacific' },
  { locode: 'JPSDJ', name: 'Sakai', country: 'Japan', countryCode: 'JP', lat: 34.58, lon: 135.45, portType: 'mixed', region: 'pacific' },
  { locode: 'JPSMZ', name: 'Shimizu', country: 'Japan', countryCode: 'JP', lat: 35.02, lon: 138.50, portType: 'mixed', region: 'pacific' },
  { locode: 'JPHIJ', name: 'Hiroshima', country: 'Japan', countryCode: 'JP', lat: 34.35, lon: 132.46, portType: 'general', region: 'pacific' },
  { locode: 'JPNGS', name: 'Nagasaki', country: 'Japan', countryCode: 'JP', lat: 32.73, lon: 129.87, portType: 'general', region: 'pacific' },
  { locode: 'JPNHA', name: 'Naha', country: 'Japan', countryCode: 'JP', lat: 26.21, lon: 127.67, portType: 'mixed', region: 'pacific' },
  { locode: 'JPTMK', name: 'Tomakomai', country: 'Japan', countryCode: 'JP', lat: 42.63, lon: 141.73, portType: 'mixed', region: 'pacific' },
  { locode: 'JPYKS', name: 'Yokosuka', country: 'Japan', countryCode: 'JP', lat: 35.28, lon: 139.67, portType: 'naval', region: 'pacific' },
  { locode: 'JPSBS', name: 'Sasebo', country: 'Japan', countryCode: 'JP', lat: 33.16, lon: 129.72, portType: 'naval', region: 'pacific' },

  // --- South Korea ---
  { locode: 'KRPUS', name: 'Busan', country: 'South Korea', countryCode: 'KR', lat: 35.10, lon: 129.04, portType: 'container', region: 'pacific' },
  { locode: 'KRINC', name: 'Incheon', country: 'South Korea', countryCode: 'KR', lat: 37.46, lon: 126.62, portType: 'mixed', region: 'pacific' },
  { locode: 'KRULS', name: 'Ulsan', country: 'South Korea', countryCode: 'KR', lat: 35.50, lon: 129.38, portType: 'tanker', region: 'pacific' },
  { locode: 'KRKWN', name: 'Gwangyang', country: 'South Korea', countryCode: 'KR', lat: 34.91, lon: 127.69, portType: 'container', region: 'pacific' },
  { locode: 'KRPTK', name: 'Pyeongtaek', country: 'South Korea', countryCode: 'KR', lat: 36.97, lon: 126.83, portType: 'mixed', region: 'pacific' },
  { locode: 'KRMOK', name: 'Mokpo', country: 'South Korea', countryCode: 'KR', lat: 34.79, lon: 126.38, portType: 'general', region: 'pacific' },
  { locode: 'KRMAS', name: 'Masan', country: 'South Korea', countryCode: 'KR', lat: 35.19, lon: 128.57, portType: 'general', region: 'pacific' },
  { locode: 'KRKAN', name: 'Gunsan', country: 'South Korea', countryCode: 'KR', lat: 35.99, lon: 126.71, portType: 'mixed', region: 'pacific' },

  // --- Singapore ---
  { locode: 'SGSIN', name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.26, lon: 103.84, portType: 'mixed', region: 'southeast_asia' },

  // --- Malaysia ---
  { locode: 'MYPKG', name: 'Port Klang', country: 'Malaysia', countryCode: 'MY', lat: 3.00, lon: 101.39, portType: 'container', region: 'southeast_asia' },
  { locode: 'MYTPP', name: 'Tanjung Pelepas', country: 'Malaysia', countryCode: 'MY', lat: 1.37, lon: 103.55, portType: 'container', region: 'southeast_asia' },
  { locode: 'MYPEN', name: 'Penang', country: 'Malaysia', countryCode: 'MY', lat: 5.42, lon: 100.35, portType: 'container', region: 'southeast_asia' },
  { locode: 'MYKUA', name: 'Kuantan', country: 'Malaysia', countryCode: 'MY', lat: 3.97, lon: 103.43, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'MYBTU', name: 'Bintulu', country: 'Malaysia', countryCode: 'MY', lat: 3.17, lon: 113.04, portType: 'lng', region: 'south_china_sea' },
  { locode: 'MYKCH', name: 'Kuching', country: 'Malaysia', countryCode: 'MY', lat: 1.55, lon: 110.35, portType: 'general', region: 'south_china_sea' },
  { locode: 'MYSDK', name: 'Sandakan', country: 'Malaysia', countryCode: 'MY', lat: 5.84, lon: 118.12, portType: 'general', region: 'south_china_sea' },
  { locode: 'MYKKI', name: 'Kota Kinabalu', country: 'Malaysia', countryCode: 'MY', lat: 6.00, lon: 116.07, portType: 'general', region: 'south_china_sea' },

  // --- Indonesia ---
  { locode: 'IDJKT', name: 'Jakarta (Tanjung Priok)', country: 'Indonesia', countryCode: 'ID', lat: -6.10, lon: 106.88, portType: 'container', region: 'southeast_asia' },
  { locode: 'IDSUB', name: 'Surabaya (Tanjung Perak)', country: 'Indonesia', countryCode: 'ID', lat: -7.20, lon: 112.73, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'IDBEL', name: 'Belawan', country: 'Indonesia', countryCode: 'ID', lat: 3.79, lon: 98.69, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'IDSRG', name: 'Semarang', country: 'Indonesia', countryCode: 'ID', lat: -6.95, lon: 110.42, portType: 'general', region: 'southeast_asia' },
  { locode: 'IDMAK', name: 'Makassar', country: 'Indonesia', countryCode: 'ID', lat: -5.14, lon: 119.43, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'IDBPN', name: 'Balikpapan', country: 'Indonesia', countryCode: 'ID', lat: -1.27, lon: 116.83, portType: 'tanker', region: 'southeast_asia' },
  { locode: 'IDPNK', name: 'Pontianak', country: 'Indonesia', countryCode: 'ID', lat: -0.03, lon: 109.34, portType: 'general', region: 'south_china_sea' },
  { locode: 'IDPLM', name: 'Palembang', country: 'Indonesia', countryCode: 'ID', lat: -2.99, lon: 104.76, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'IDBTM', name: 'Batam', country: 'Indonesia', countryCode: 'ID', lat: 1.05, lon: 104.03, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'IDCIL', name: 'Cilacap', country: 'Indonesia', countryCode: 'ID', lat: -7.74, lon: 109.01, portType: 'tanker', region: 'indian_ocean' },

  // --- Vietnam ---
  { locode: 'VNSGN', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', lat: 10.77, lon: 106.70, portType: 'container', region: 'south_china_sea' },
  { locode: 'VNHPH', name: 'Haiphong', country: 'Vietnam', countryCode: 'VN', lat: 20.86, lon: 106.68, portType: 'container', region: 'south_china_sea' },
  { locode: 'VNDAN', name: 'Da Nang', country: 'Vietnam', countryCode: 'VN', lat: 16.07, lon: 108.22, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'VNVUT', name: 'Vung Tau', country: 'Vietnam', countryCode: 'VN', lat: 10.35, lon: 107.07, portType: 'tanker', region: 'south_china_sea' },
  { locode: 'VNQUI', name: 'Quy Nhon', country: 'Vietnam', countryCode: 'VN', lat: 13.77, lon: 109.22, portType: 'general', region: 'south_china_sea' },
  { locode: 'VNCLI', name: 'Cam Ranh', country: 'Vietnam', countryCode: 'VN', lat: 11.93, lon: 109.16, portType: 'naval', region: 'south_china_sea' },

  // --- Philippines ---
  { locode: 'PHMNL', name: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.58, lon: 120.97, portType: 'container', region: 'south_china_sea' },
  { locode: 'PHCEB', name: 'Cebu', country: 'Philippines', countryCode: 'PH', lat: 10.30, lon: 123.90, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'PHSUB', name: 'Subic Bay', country: 'Philippines', countryCode: 'PH', lat: 14.79, lon: 120.28, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'PHDVO', name: 'Davao', country: 'Philippines', countryCode: 'PH', lat: 7.07, lon: 125.61, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'PHBTG', name: 'Batangas', country: 'Philippines', countryCode: 'PH', lat: 13.76, lon: 121.06, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'PHGSI', name: 'General Santos', country: 'Philippines', countryCode: 'PH', lat: 6.11, lon: 125.17, portType: 'general', region: 'southeast_asia' },

  // --- Thailand ---
  { locode: 'THLCH', name: 'Laem Chabang', country: 'Thailand', countryCode: 'TH', lat: 13.08, lon: 100.88, portType: 'container', region: 'southeast_asia' },
  { locode: 'THBKK', name: 'Bangkok (Klong Toey)', country: 'Thailand', countryCode: 'TH', lat: 13.71, lon: 100.57, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'THSGZ', name: 'Songkhla', country: 'Thailand', countryCode: 'TH', lat: 7.19, lon: 100.60, portType: 'general', region: 'southeast_asia' },
  { locode: 'THSRI', name: 'Si Racha', country: 'Thailand', countryCode: 'TH', lat: 13.17, lon: 100.93, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'THMPT', name: 'Map Ta Phut', country: 'Thailand', countryCode: 'TH', lat: 12.72, lon: 101.16, portType: 'tanker', region: 'southeast_asia' },

  // --- India ---
  { locode: 'INBOM', name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 18.95, lon: 72.84, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INMAA', name: 'Chennai', country: 'India', countryCode: 'IN', lat: 13.10, lon: 80.29, portType: 'container', region: 'indian_ocean' },
  { locode: 'INNSA', name: 'Nhava Sheva (JNPT)', country: 'India', countryCode: 'IN', lat: 18.95, lon: 72.95, portType: 'container', region: 'indian_ocean' },
  { locode: 'INMUN', name: 'Mundra', country: 'India', countryCode: 'IN', lat: 22.73, lon: 69.72, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INCCU', name: 'Kolkata (Haldia)', country: 'India', countryCode: 'IN', lat: 22.03, lon: 88.06, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INKCZ', name: 'Kochi (Cochin)', country: 'India', countryCode: 'IN', lat: 9.97, lon: 76.27, portType: 'container', region: 'indian_ocean' },
  { locode: 'INVTZ', name: 'Visakhapatnam', country: 'India', countryCode: 'IN', lat: 17.69, lon: 83.30, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INTUT', name: 'Tuticorin', country: 'India', countryCode: 'IN', lat: 8.76, lon: 78.20, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INKRI', name: 'Krishnapatnam', country: 'India', countryCode: 'IN', lat: 14.26, lon: 80.13, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INPAV', name: 'Paradip', country: 'India', countryCode: 'IN', lat: 20.26, lon: 86.67, portType: 'bulk', region: 'indian_ocean' },
  { locode: 'INPIP', name: 'Pipavav', country: 'India', countryCode: 'IN', lat: 20.95, lon: 71.53, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INMRM', name: 'Mormugao', country: 'India', countryCode: 'IN', lat: 15.41, lon: 73.80, portType: 'bulk', region: 'indian_ocean' },
  { locode: 'INKDL', name: 'Kandla', country: 'India', countryCode: 'IN', lat: 23.03, lon: 70.22, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INMGR', name: 'Mangalore', country: 'India', countryCode: 'IN', lat: 12.85, lon: 74.81, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INDAH', name: 'Dahej', country: 'India', countryCode: 'IN', lat: 21.71, lon: 72.58, portType: 'lng', region: 'indian_ocean' },
  { locode: 'INHZR', name: 'Hazira', country: 'India', countryCode: 'IN', lat: 21.10, lon: 72.63, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INENN', name: 'Ennore', country: 'India', countryCode: 'IN', lat: 13.22, lon: 80.32, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INNML', name: 'New Mangalore', country: 'India', countryCode: 'IN', lat: 12.92, lon: 74.80, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'INSIK', name: 'Sikka', country: 'India', countryCode: 'IN', lat: 22.41, lon: 69.84, portType: 'tanker', region: 'indian_ocean' },

  // --- Australia ---
  { locode: 'AUMEL', name: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.82, lon: 144.92, portType: 'container', region: 'oceania' },
  { locode: 'AUSYD', name: 'Sydney (Port Botany)', country: 'Australia', countryCode: 'AU', lat: -33.97, lon: 151.21, portType: 'container', region: 'oceania' },
  { locode: 'AUBNE', name: 'Brisbane', country: 'Australia', countryCode: 'AU', lat: -27.38, lon: 153.17, portType: 'container', region: 'oceania' },
  { locode: 'AUFRE', name: 'Fremantle', country: 'Australia', countryCode: 'AU', lat: -32.06, lon: 115.74, portType: 'container', region: 'indian_ocean' },
  { locode: 'AUADL', name: 'Adelaide', country: 'Australia', countryCode: 'AU', lat: -34.79, lon: 138.51, portType: 'mixed', region: 'oceania' },
  { locode: 'AUDAW', name: 'Darwin', country: 'Australia', countryCode: 'AU', lat: -12.46, lon: 130.85, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'AUPHE', name: 'Port Hedland', country: 'Australia', countryCode: 'AU', lat: -20.31, lon: 118.58, portType: 'bulk', region: 'indian_ocean' },
  { locode: 'AUDPO', name: 'Dampier', country: 'Australia', countryCode: 'AU', lat: -20.66, lon: 116.71, portType: 'bulk', region: 'indian_ocean' },
  { locode: 'AUGLT', name: 'Gladstone', country: 'Australia', countryCode: 'AU', lat: -23.85, lon: 151.27, portType: 'bulk', region: 'oceania' },
  { locode: 'AUNCA', name: 'Newcastle', country: 'Australia', countryCode: 'AU', lat: -32.92, lon: 151.78, portType: 'bulk', region: 'oceania' },
  { locode: 'AUTOV', name: 'Townsville', country: 'Australia', countryCode: 'AU', lat: -19.25, lon: 146.77, portType: 'mixed', region: 'oceania' },
  { locode: 'AUHAY', name: 'Hay Point', country: 'Australia', countryCode: 'AU', lat: -21.28, lon: 149.30, portType: 'bulk', region: 'oceania' },

  // --- New Zealand ---
  { locode: 'NZAKL', name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.84, lon: 174.76, portType: 'container', region: 'oceania' },
  { locode: 'NZTRG', name: 'Tauranga', country: 'New Zealand', countryCode: 'NZ', lat: -37.65, lon: 176.17, portType: 'container', region: 'oceania' },
  { locode: 'NZLYT', name: 'Lyttelton', country: 'New Zealand', countryCode: 'NZ', lat: -43.61, lon: 172.72, portType: 'mixed', region: 'oceania' },
  { locode: 'NZWLG', name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', lat: -41.28, lon: 174.78, portType: 'mixed', region: 'oceania' },

  // --- Taiwan ---
  { locode: 'TWKHH', name: 'Kaohsiung', country: 'Taiwan', countryCode: 'TW', lat: 22.61, lon: 120.28, portType: 'container', region: 'south_china_sea' },
  { locode: 'TWKEL', name: 'Keelung (Taipei)', country: 'Taiwan', countryCode: 'TW', lat: 25.15, lon: 121.74, portType: 'container', region: 'pacific' },
  { locode: 'TWTXG', name: 'Taichung', country: 'Taiwan', countryCode: 'TW', lat: 24.28, lon: 120.52, portType: 'mixed', region: 'south_china_sea' },
  { locode: 'TWHUN', name: 'Hualien', country: 'Taiwan', countryCode: 'TW', lat: 23.98, lon: 121.62, portType: 'general', region: 'pacific' },

  // --- Bangladesh ---
  { locode: 'BDCGP', name: 'Chittagong', country: 'Bangladesh', countryCode: 'BD', lat: 22.33, lon: 91.83, portType: 'container', region: 'indian_ocean' },
  { locode: 'BDMGL', name: 'Mongla', country: 'Bangladesh', countryCode: 'BD', lat: 22.49, lon: 89.60, portType: 'general', region: 'indian_ocean' },
  { locode: 'BDPAY', name: 'Payra', country: 'Bangladesh', countryCode: 'BD', lat: 21.80, lon: 90.32, portType: 'mixed', region: 'indian_ocean' },

  // --- Sri Lanka ---
  { locode: 'LKCMB', name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', lat: 6.94, lon: 79.84, portType: 'container', region: 'indian_ocean' },
  { locode: 'LKHBA', name: 'Hambantota', country: 'Sri Lanka', countryCode: 'LK', lat: 6.12, lon: 81.12, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'LKTRR', name: 'Trincomalee', country: 'Sri Lanka', countryCode: 'LK', lat: 8.57, lon: 81.23, portType: 'mixed', region: 'indian_ocean' },

  // --- Pakistan ---
  { locode: 'PKKHI', name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.84, lon: 67.00, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'PKQCT', name: 'Qasim (Port Muhammad Bin Qasim)', country: 'Pakistan', countryCode: 'PK', lat: 24.78, lon: 67.35, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'PKGWD', name: 'Gwadar', country: 'Pakistan', countryCode: 'PK', lat: 25.12, lon: 62.33, portType: 'mixed', region: 'indian_ocean' },

  // --- Myanmar ---
  { locode: 'MMRGN', name: 'Yangon', country: 'Myanmar', countryCode: 'MM', lat: 16.87, lon: 96.17, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'MMSWE', name: 'Sittwe', country: 'Myanmar', countryCode: 'MM', lat: 20.15, lon: 92.90, portType: 'general', region: 'indian_ocean' },
  { locode: 'MMTHI', name: 'Thilawa', country: 'Myanmar', countryCode: 'MM', lat: 16.68, lon: 96.25, portType: 'container', region: 'indian_ocean' },

  // --- Cambodia ---
  { locode: 'KHSHV', name: 'Sihanoukville', country: 'Cambodia', countryCode: 'KH', lat: 10.63, lon: 103.50, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'KHPNH', name: 'Phnom Penh', country: 'Cambodia', countryCode: 'KH', lat: 11.55, lon: 104.93, portType: 'general', region: 'southeast_asia' },

  // --- Brunei ---
  { locode: 'BNMUA', name: 'Muara', country: 'Brunei', countryCode: 'BN', lat: 5.02, lon: 115.08, portType: 'mixed', region: 'south_china_sea' },

  // --- Pacific Islands ---
  { locode: 'PGGUR', name: 'Lae', country: 'Papua New Guinea', countryCode: 'PG', lat: -6.73, lon: 147.00, portType: 'general', region: 'oceania' },
  { locode: 'FJSUV', name: 'Suva', country: 'Fiji', countryCode: 'FJ', lat: -18.14, lon: 178.44, portType: 'general', region: 'oceania' },
  { locode: 'WSAPW', name: 'Apia', country: 'Samoa', countryCode: 'WS', lat: -13.83, lon: -171.76, portType: 'general', region: 'oceania' },
  { locode: 'GUAPR', name: 'Apra Harbor', country: 'Guam', countryCode: 'GU', lat: 13.45, lon: 144.66, portType: 'naval', region: 'oceania' },

  // =========================================================================
  // MIDDLE EAST (~50 ports)
  // =========================================================================

  // --- UAE ---
  { locode: 'AEJEA', name: 'Jebel Ali', country: 'UAE', countryCode: 'AE', lat: 25.01, lon: 55.06, portType: 'container', region: 'persian_gulf' },
  { locode: 'AEAUH', name: 'Abu Dhabi (Khalifa Port)', country: 'UAE', countryCode: 'AE', lat: 24.81, lon: 54.65, portType: 'container', region: 'persian_gulf' },
  { locode: 'AEFJR', name: 'Fujairah', country: 'UAE', countryCode: 'AE', lat: 25.12, lon: 56.35, portType: 'tanker', region: 'persian_gulf' },
  { locode: 'AESHJ', name: 'Sharjah (Khor Fakkan)', country: 'UAE', countryCode: 'AE', lat: 25.34, lon: 56.36, portType: 'container', region: 'persian_gulf' },
  { locode: 'AERKT', name: 'Ras Al Khaimah', country: 'UAE', countryCode: 'AE', lat: 25.79, lon: 55.94, portType: 'general', region: 'persian_gulf' },
  { locode: 'AERUW', name: 'Ruwais', country: 'UAE', countryCode: 'AE', lat: 24.11, lon: 52.73, portType: 'tanker', region: 'persian_gulf' },

  // --- Saudi Arabia ---
  { locode: 'SAJED', name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.49, lon: 39.17, portType: 'container', region: 'red_sea' },
  { locode: 'SADMM', name: 'Dammam (King Abdulaziz)', country: 'Saudi Arabia', countryCode: 'SA', lat: 26.47, lon: 50.11, portType: 'container', region: 'persian_gulf' },
  { locode: 'SARAT', name: 'Ras Tanura', country: 'Saudi Arabia', countryCode: 'SA', lat: 26.64, lon: 50.16, portType: 'tanker', region: 'persian_gulf' },
  { locode: 'SAYBU', name: 'Yanbu', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.09, lon: 38.06, portType: 'tanker', region: 'red_sea' },
  { locode: 'SAJBI', name: 'Jubail', country: 'Saudi Arabia', countryCode: 'SA', lat: 27.01, lon: 49.66, portType: 'mixed', region: 'persian_gulf' },
  { locode: 'SAKAC', name: 'King Abdullah', country: 'Saudi Arabia', countryCode: 'SA', lat: 22.81, lon: 38.99, portType: 'container', region: 'red_sea' },

  // --- Oman ---
  { locode: 'OMSLL', name: 'Salalah', country: 'Oman', countryCode: 'OM', lat: 16.94, lon: 54.00, portType: 'container', region: 'indian_ocean' },
  { locode: 'OMSOH', name: 'Sohar', country: 'Oman', countryCode: 'OM', lat: 24.37, lon: 56.73, portType: 'mixed', region: 'persian_gulf' },
  { locode: 'OMMCT', name: 'Muscat (Sultan Qaboos)', country: 'Oman', countryCode: 'OM', lat: 23.63, lon: 58.57, portType: 'mixed', region: 'persian_gulf' },
  { locode: 'OMDQM', name: 'Duqm', country: 'Oman', countryCode: 'OM', lat: 19.67, lon: 57.70, portType: 'mixed', region: 'indian_ocean' },

  // --- Qatar ---
  { locode: 'QAHAM', name: 'Hamad Port', country: 'Qatar', countryCode: 'QA', lat: 25.20, lon: 51.62, portType: 'container', region: 'persian_gulf' },
  { locode: 'QARAF', name: 'Ras Laffan', country: 'Qatar', countryCode: 'QA', lat: 25.93, lon: 51.54, portType: 'lng', region: 'persian_gulf' },

  // --- Kuwait ---
  { locode: 'KWSWK', name: 'Shuwaikh', country: 'Kuwait', countryCode: 'KW', lat: 29.35, lon: 47.92, portType: 'mixed', region: 'persian_gulf' },
  { locode: 'KWSAA', name: 'Shuaiba', country: 'Kuwait', countryCode: 'KW', lat: 29.04, lon: 48.16, portType: 'tanker', region: 'persian_gulf' },
  { locode: 'KWMIA', name: 'Mina Al Ahmadi', country: 'Kuwait', countryCode: 'KW', lat: 29.07, lon: 48.16, portType: 'tanker', region: 'persian_gulf' },

  // --- Bahrain ---
  { locode: 'BHKBS', name: 'Khalifa Bin Salman', country: 'Bahrain', countryCode: 'BH', lat: 26.01, lon: 50.60, portType: 'container', region: 'persian_gulf' },
  { locode: 'BHMIN', name: 'Mina Salman', country: 'Bahrain', countryCode: 'BH', lat: 26.22, lon: 50.60, portType: 'naval', region: 'persian_gulf' },

  // --- Iraq ---
  { locode: 'IQUQR', name: 'Umm Qasr', country: 'Iraq', countryCode: 'IQ', lat: 30.03, lon: 47.93, portType: 'container', region: 'persian_gulf' },
  { locode: 'IQBSR', name: 'Basra', country: 'Iraq', countryCode: 'IQ', lat: 30.52, lon: 47.78, portType: 'tanker', region: 'persian_gulf' },
  { locode: 'IQFAO', name: 'Al Faw (Grand Faw)', country: 'Iraq', countryCode: 'IQ', lat: 29.97, lon: 48.47, portType: 'mixed', region: 'persian_gulf' },

  // --- Iran ---
  { locode: 'IRBND', name: 'Bandar Abbas', country: 'Iran', countryCode: 'IR', lat: 27.18, lon: 56.28, portType: 'container', region: 'persian_gulf' },
  { locode: 'IRBUZ', name: 'Bushehr', country: 'Iran', countryCode: 'IR', lat: 28.97, lon: 50.83, portType: 'mixed', region: 'persian_gulf' },
  { locode: 'IRKHK', name: 'Kharg Island', country: 'Iran', countryCode: 'IR', lat: 29.23, lon: 50.31, portType: 'tanker', region: 'persian_gulf' },
  { locode: 'IRCHB', name: 'Chabahar', country: 'Iran', countryCode: 'IR', lat: 25.30, lon: 60.60, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'IRBKM', name: 'Bandar Imam Khomeini', country: 'Iran', countryCode: 'IR', lat: 30.43, lon: 49.08, portType: 'mixed', region: 'persian_gulf' },
  { locode: 'IRASM', name: 'Assaluyeh', country: 'Iran', countryCode: 'IR', lat: 27.48, lon: 52.58, portType: 'lng', region: 'persian_gulf' },

  // --- Israel ---
  { locode: 'ILHFA', name: 'Haifa', country: 'Israel', countryCode: 'IL', lat: 32.82, lon: 34.98, portType: 'container', region: 'mediterranean' },
  { locode: 'ILASH', name: 'Ashdod', country: 'Israel', countryCode: 'IL', lat: 31.83, lon: 34.64, portType: 'container', region: 'mediterranean' },
  { locode: 'ILEIL', name: 'Eilat', country: 'Israel', countryCode: 'IL', lat: 29.55, lon: 34.95, portType: 'general', region: 'red_sea' },

  // --- Jordan ---
  { locode: 'JOAQJ', name: 'Aqaba', country: 'Jordan', countryCode: 'JO', lat: 29.52, lon: 35.01, portType: 'mixed', region: 'red_sea' },

  // --- Lebanon ---
  { locode: 'LBBEY', name: 'Beirut', country: 'Lebanon', countryCode: 'LB', lat: 33.90, lon: 35.52, portType: 'container', region: 'mediterranean' },
  { locode: 'LBKYE', name: 'Tripoli (Lebanon)', country: 'Lebanon', countryCode: 'LB', lat: 34.44, lon: 35.83, portType: 'general', region: 'mediterranean' },

  // --- Yemen ---
  { locode: 'YEADE', name: 'Aden', country: 'Yemen', countryCode: 'YE', lat: 12.79, lon: 45.03, portType: 'mixed', region: 'red_sea' },
  { locode: 'YEHOD', name: 'Hodeidah', country: 'Yemen', countryCode: 'YE', lat: 14.80, lon: 42.95, portType: 'bulk', region: 'red_sea' },
  { locode: 'YEMKX', name: 'Mokha', country: 'Yemen', countryCode: 'YE', lat: 13.32, lon: 43.25, portType: 'general', region: 'red_sea' },

  // =========================================================================
  // EUROPE (~150 ports)
  // =========================================================================

  // --- Netherlands ---
  { locode: 'NLRTM', name: 'Rotterdam', country: 'Netherlands', countryCode: 'NL', lat: 51.90, lon: 4.50, portType: 'mixed', region: 'north_sea' },
  { locode: 'NLAMS', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.38, lon: 4.90, portType: 'mixed', region: 'north_sea' },
  { locode: 'NLVLI', name: 'Vlissingen (Flushing)', country: 'Netherlands', countryCode: 'NL', lat: 51.44, lon: 3.57, portType: 'mixed', region: 'north_sea' },
  { locode: 'NLMOE', name: 'Moerdijk', country: 'Netherlands', countryCode: 'NL', lat: 51.70, lon: 4.59, portType: 'mixed', region: 'north_sea' },

  // --- Belgium ---
  { locode: 'BEANR', name: 'Antwerp', country: 'Belgium', countryCode: 'BE', lat: 51.26, lon: 4.40, portType: 'mixed', region: 'north_sea' },
  { locode: 'BEZEE', name: 'Zeebrugge', country: 'Belgium', countryCode: 'BE', lat: 51.33, lon: 3.18, portType: 'container', region: 'north_sea' },
  { locode: 'BEGNE', name: 'Ghent', country: 'Belgium', countryCode: 'BE', lat: 51.05, lon: 3.73, portType: 'mixed', region: 'north_sea' },

  // --- Germany ---
  { locode: 'DEHAM', name: 'Hamburg', country: 'Germany', countryCode: 'DE', lat: 53.54, lon: 9.99, portType: 'container', region: 'north_sea' },
  { locode: 'DEBRV', name: 'Bremerhaven', country: 'Germany', countryCode: 'DE', lat: 53.54, lon: 8.58, portType: 'container', region: 'north_sea' },
  { locode: 'DEWVN', name: 'Wilhelmshaven', country: 'Germany', countryCode: 'DE', lat: 53.52, lon: 8.14, portType: 'mixed', region: 'north_sea' },
  { locode: 'DEROS', name: 'Rostock', country: 'Germany', countryCode: 'DE', lat: 54.15, lon: 12.10, portType: 'mixed', region: 'baltic' },
  { locode: 'DELBC', name: 'Lubeck', country: 'Germany', countryCode: 'DE', lat: 53.87, lon: 10.69, portType: 'mixed', region: 'baltic' },
  { locode: 'DEBRU', name: 'Brunsbuttel', country: 'Germany', countryCode: 'DE', lat: 53.89, lon: 9.14, portType: 'mixed', region: 'north_sea' },

  // --- UK ---
  { locode: 'GBFXT', name: 'Felixstowe', country: 'United Kingdom', countryCode: 'GB', lat: 51.95, lon: 1.33, portType: 'container', region: 'north_sea' },
  { locode: 'GBSOU', name: 'Southampton', country: 'United Kingdom', countryCode: 'GB', lat: 50.90, lon: -1.40, portType: 'container', region: 'north_sea' },
  { locode: 'GBLGP', name: 'London Gateway', country: 'United Kingdom', countryCode: 'GB', lat: 51.50, lon: 0.47, portType: 'container', region: 'north_sea' },
  { locode: 'GBLIV', name: 'Liverpool', country: 'United Kingdom', countryCode: 'GB', lat: 53.44, lon: -3.02, portType: 'container', region: 'atlantic_north' },
  { locode: 'GBIMM', name: 'Immingham', country: 'United Kingdom', countryCode: 'GB', lat: 53.63, lon: -0.19, portType: 'bulk', region: 'north_sea' },
  { locode: 'GBTEE', name: 'Teesport', country: 'United Kingdom', countryCode: 'GB', lat: 54.60, lon: -1.15, portType: 'mixed', region: 'north_sea' },
  { locode: 'GBGRG', name: 'Grangemouth', country: 'United Kingdom', countryCode: 'GB', lat: 56.02, lon: -3.72, portType: 'mixed', region: 'north_sea' },
  { locode: 'GBMIL', name: 'Milford Haven', country: 'United Kingdom', countryCode: 'GB', lat: 51.71, lon: -5.04, portType: 'lng', region: 'atlantic_north' },
  { locode: 'GBHUL', name: 'Hull', country: 'United Kingdom', countryCode: 'GB', lat: 53.74, lon: -0.28, portType: 'mixed', region: 'north_sea' },
  { locode: 'GBABZ', name: 'Aberdeen', country: 'United Kingdom', countryCode: 'GB', lat: 57.14, lon: -2.08, portType: 'mixed', region: 'north_sea' },
  { locode: 'GBBEL', name: 'Belfast', country: 'United Kingdom', countryCode: 'GB', lat: 54.63, lon: -5.88, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'GBDVR', name: 'Dover', country: 'United Kingdom', countryCode: 'GB', lat: 51.13, lon: 1.32, portType: 'general', region: 'north_sea' },
  { locode: 'GBGIB', name: 'Gibraltar', country: 'United Kingdom (Gibraltar)', countryCode: 'GI', lat: 36.14, lon: -5.35, portType: 'naval', region: 'mediterranean' },

  // --- France ---
  { locode: 'FRLEH', name: 'Le Havre', country: 'France', countryCode: 'FR', lat: 49.48, lon: 0.11, portType: 'container', region: 'north_sea' },
  { locode: 'FRMRS', name: 'Marseille (Fos-sur-Mer)', country: 'France', countryCode: 'FR', lat: 43.41, lon: 4.88, portType: 'mixed', region: 'mediterranean' },
  { locode: 'FRDKK', name: 'Dunkirk', country: 'France', countryCode: 'FR', lat: 51.05, lon: 2.37, portType: 'mixed', region: 'north_sea' },
  { locode: 'FRNTE', name: 'Nantes-Saint Nazaire', country: 'France', countryCode: 'FR', lat: 47.27, lon: -2.21, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'FRBOD', name: 'Bordeaux', country: 'France', countryCode: 'FR', lat: 44.87, lon: -0.56, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'FRROU', name: 'Rouen', country: 'France', countryCode: 'FR', lat: 49.44, lon: 1.09, portType: 'bulk', region: 'north_sea' },
  { locode: 'FRBAS', name: 'Bastia', country: 'France', countryCode: 'FR', lat: 42.70, lon: 9.45, portType: 'general', region: 'mediterranean' },
  { locode: 'FRSET', name: 'Sete', country: 'France', countryCode: 'FR', lat: 43.40, lon: 3.70, portType: 'general', region: 'mediterranean' },

  // --- Spain ---
  { locode: 'ESVLC', name: 'Valencia', country: 'Spain', countryCode: 'ES', lat: 39.45, lon: -0.32, portType: 'container', region: 'mediterranean' },
  { locode: 'ESBCN', name: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.35, lon: 2.17, portType: 'container', region: 'mediterranean' },
  { locode: 'ESALG', name: 'Algeciras', country: 'Spain', countryCode: 'ES', lat: 36.13, lon: -5.43, portType: 'container', region: 'mediterranean' },
  { locode: 'ESBIO', name: 'Bilbao', country: 'Spain', countryCode: 'ES', lat: 43.32, lon: -3.02, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'ESLPA', name: 'Las Palmas', country: 'Spain', countryCode: 'ES', lat: 28.14, lon: -15.42, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'ESTAR', name: 'Tarragona', country: 'Spain', countryCode: 'ES', lat: 41.10, lon: 1.25, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ESCAS', name: 'Castellon', country: 'Spain', countryCode: 'ES', lat: 39.97, lon: -0.02, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ESCAR', name: 'Cartagena', country: 'Spain', countryCode: 'ES', lat: 37.60, lon: -0.98, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ESHUE', name: 'Huelva', country: 'Spain', countryCode: 'ES', lat: 37.25, lon: -6.95, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'ESVGO', name: 'Vigo', country: 'Spain', countryCode: 'ES', lat: 42.24, lon: -8.72, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'ESSCT', name: 'Santa Cruz de Tenerife', country: 'Spain', countryCode: 'ES', lat: 28.47, lon: -16.25, portType: 'mixed', region: 'atlantic_north' },

  // --- Italy ---
  { locode: 'ITGOA', name: 'Genoa', country: 'Italy', countryCode: 'IT', lat: 44.41, lon: 8.93, portType: 'container', region: 'mediterranean' },
  { locode: 'ITLSP', name: 'La Spezia', country: 'Italy', countryCode: 'IT', lat: 44.10, lon: 9.83, portType: 'container', region: 'mediterranean' },
  { locode: 'ITTRS', name: 'Trieste', country: 'Italy', countryCode: 'IT', lat: 45.64, lon: 13.78, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ITGIT', name: 'Gioia Tauro', country: 'Italy', countryCode: 'IT', lat: 38.43, lon: 15.89, portType: 'container', region: 'mediterranean' },
  { locode: 'ITNAP', name: 'Naples', country: 'Italy', countryCode: 'IT', lat: 40.84, lon: 14.27, portType: 'container', region: 'mediterranean' },
  { locode: 'ITSAL', name: 'Salerno', country: 'Italy', countryCode: 'IT', lat: 40.68, lon: 14.76, portType: 'container', region: 'mediterranean' },
  { locode: 'ITLIV', name: 'Livorno', country: 'Italy', countryCode: 'IT', lat: 43.55, lon: 10.30, portType: 'container', region: 'mediterranean' },
  { locode: 'ITRAV', name: 'Ravenna', country: 'Italy', countryCode: 'IT', lat: 44.42, lon: 12.27, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ITTAR', name: 'Taranto', country: 'Italy', countryCode: 'IT', lat: 40.47, lon: 17.24, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ITCAG', name: 'Cagliari', country: 'Italy', countryCode: 'IT', lat: 39.21, lon: 9.11, portType: 'container', region: 'mediterranean' },
  { locode: 'ITVCE', name: 'Venice', country: 'Italy', countryCode: 'IT', lat: 45.44, lon: 12.31, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ITAOI', name: 'Ancona', country: 'Italy', countryCode: 'IT', lat: 43.62, lon: 13.51, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ITMLZ', name: 'Milazzo', country: 'Italy', countryCode: 'IT', lat: 38.22, lon: 15.24, portType: 'tanker', region: 'mediterranean' },
  { locode: 'ITPMO', name: 'Palermo', country: 'Italy', countryCode: 'IT', lat: 38.12, lon: 13.37, portType: 'general', region: 'mediterranean' },
  { locode: 'ITAUG', name: 'Augusta', country: 'Italy', countryCode: 'IT', lat: 37.23, lon: 15.22, portType: 'tanker', region: 'mediterranean' },

  // --- Greece ---
  { locode: 'GRPIR', name: 'Piraeus', country: 'Greece', countryCode: 'GR', lat: 37.94, lon: 23.65, portType: 'container', region: 'mediterranean' },
  { locode: 'GRTHE', name: 'Thessaloniki', country: 'Greece', countryCode: 'GR', lat: 40.63, lon: 22.94, portType: 'container', region: 'mediterranean' },
  { locode: 'GRHAK', name: 'Heraklion', country: 'Greece', countryCode: 'GR', lat: 35.34, lon: 25.13, portType: 'general', region: 'mediterranean' },
  { locode: 'GRPAT', name: 'Patras', country: 'Greece', countryCode: 'GR', lat: 38.25, lon: 21.73, portType: 'general', region: 'mediterranean' },
  { locode: 'GRELE', name: 'Eleusis', country: 'Greece', countryCode: 'GR', lat: 38.04, lon: 23.54, portType: 'tanker', region: 'mediterranean' },

  // --- Turkey ---
  { locode: 'TRIST', name: 'Istanbul (Ambarli)', country: 'Turkey', countryCode: 'TR', lat: 40.96, lon: 28.70, portType: 'container', region: 'mediterranean' },
  { locode: 'TRMER', name: 'Mersin', country: 'Turkey', countryCode: 'TR', lat: 36.79, lon: 34.64, portType: 'container', region: 'mediterranean' },
  { locode: 'TRIZM', name: 'Izmir (Alsancak)', country: 'Turkey', countryCode: 'TR', lat: 38.44, lon: 27.14, portType: 'container', region: 'mediterranean' },
  { locode: 'TRGEM', name: 'Gemlik', country: 'Turkey', countryCode: 'TR', lat: 40.43, lon: 29.15, portType: 'mixed', region: 'mediterranean' },
  { locode: 'TRALX', name: 'Aliaga', country: 'Turkey', countryCode: 'TR', lat: 38.80, lon: 26.97, portType: 'mixed', region: 'mediterranean' },
  { locode: 'TRISK', name: 'Iskenderun', country: 'Turkey', countryCode: 'TR', lat: 36.60, lon: 36.17, portType: 'mixed', region: 'mediterranean' },
  { locode: 'TRTCE', name: 'Tekirdag', country: 'Turkey', countryCode: 'TR', lat: 40.98, lon: 27.52, portType: 'mixed', region: 'mediterranean' },
  { locode: 'TRABF', name: 'Antalya', country: 'Turkey', countryCode: 'TR', lat: 36.83, lon: 30.61, portType: 'general', region: 'mediterranean' },
  { locode: 'TRTRA', name: 'Trabzon', country: 'Turkey', countryCode: 'TR', lat: 41.00, lon: 39.72, portType: 'mixed', region: 'black_sea' },
  { locode: 'TRSAM', name: 'Samsun', country: 'Turkey', countryCode: 'TR', lat: 41.29, lon: 36.34, portType: 'mixed', region: 'black_sea' },
  { locode: 'TRCRK', name: 'Ceyhan', country: 'Turkey', countryCode: 'TR', lat: 36.88, lon: 35.88, portType: 'tanker', region: 'mediterranean' },

  // --- Portugal ---
  { locode: 'PTSIE', name: 'Sines', country: 'Portugal', countryCode: 'PT', lat: 37.95, lon: -8.87, portType: 'container', region: 'atlantic_north' },
  { locode: 'PTLIS', name: 'Lisbon', country: 'Portugal', countryCode: 'PT', lat: 38.71, lon: -9.14, portType: 'container', region: 'atlantic_north' },
  { locode: 'PTLEI', name: 'Leixoes', country: 'Portugal', countryCode: 'PT', lat: 41.18, lon: -8.70, portType: 'container', region: 'atlantic_north' },

  // --- Poland ---
  { locode: 'PLGDN', name: 'Gdansk', country: 'Poland', countryCode: 'PL', lat: 54.40, lon: 18.66, portType: 'container', region: 'baltic' },
  { locode: 'PLGDY', name: 'Gdynia', country: 'Poland', countryCode: 'PL', lat: 54.53, lon: 18.55, portType: 'container', region: 'baltic' },
  { locode: 'PLSZZ', name: 'Szczecin', country: 'Poland', countryCode: 'PL', lat: 53.43, lon: 14.55, portType: 'mixed', region: 'baltic' },
  { locode: 'PLSWI', name: 'Swinoujscie', country: 'Poland', countryCode: 'PL', lat: 53.91, lon: 14.25, portType: 'lng', region: 'baltic' },

  // --- Scandinavia ---
  { locode: 'SEGOT', name: 'Gothenburg', country: 'Sweden', countryCode: 'SE', lat: 57.71, lon: 11.99, portType: 'container', region: 'north_sea' },
  { locode: 'SESTO', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.33, lon: 18.07, portType: 'mixed', region: 'baltic' },
  { locode: 'SEMAL', name: 'Malmo', country: 'Sweden', countryCode: 'SE', lat: 55.60, lon: 13.01, portType: 'mixed', region: 'baltic' },
  { locode: 'SELUL', name: 'Lulea', country: 'Sweden', countryCode: 'SE', lat: 65.58, lon: 22.15, portType: 'bulk', region: 'baltic' },
  { locode: 'DKCPH', name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.70, lon: 12.60, portType: 'container', region: 'baltic' },
  { locode: 'DKAAR', name: 'Aarhus', country: 'Denmark', countryCode: 'DK', lat: 56.15, lon: 10.22, portType: 'container', region: 'baltic' },
  { locode: 'DKFRC', name: 'Fredericia', country: 'Denmark', countryCode: 'DK', lat: 55.56, lon: 9.75, portType: 'mixed', region: 'baltic' },
  { locode: 'NOOSL', name: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.91, lon: 10.73, portType: 'mixed', region: 'north_sea' },
  { locode: 'NOBER', name: 'Bergen', country: 'Norway', countryCode: 'NO', lat: 60.39, lon: 5.32, portType: 'mixed', region: 'north_sea' },
  { locode: 'NOSVG', name: 'Stavanger', country: 'Norway', countryCode: 'NO', lat: 58.97, lon: 5.73, portType: 'tanker', region: 'north_sea' },
  { locode: 'NOTRD', name: 'Trondheim', country: 'Norway', countryCode: 'NO', lat: 63.43, lon: 10.40, portType: 'mixed', region: 'north_sea' },
  { locode: 'NONAR', name: 'Narvik', country: 'Norway', countryCode: 'NO', lat: 68.43, lon: 17.43, portType: 'bulk', region: 'arctic' },
  { locode: 'FIHEL', name: 'Helsinki', country: 'Finland', countryCode: 'FI', lat: 60.17, lon: 24.94, portType: 'container', region: 'baltic' },
  { locode: 'FIKOK', name: 'Kokkola', country: 'Finland', countryCode: 'FI', lat: 63.84, lon: 23.13, portType: 'bulk', region: 'baltic' },
  { locode: 'FIHKO', name: 'HaminaKotka', country: 'Finland', countryCode: 'FI', lat: 60.47, lon: 26.93, portType: 'container', region: 'baltic' },
  { locode: 'FITUR', name: 'Turku', country: 'Finland', countryCode: 'FI', lat: 60.45, lon: 22.25, portType: 'mixed', region: 'baltic' },
  { locode: 'FIRAU', name: 'Rauma', country: 'Finland', countryCode: 'FI', lat: 61.13, lon: 21.47, portType: 'mixed', region: 'baltic' },

  // --- Baltic States ---
  { locode: 'LVRIX', name: 'Riga', country: 'Latvia', countryCode: 'LV', lat: 56.95, lon: 24.11, portType: 'container', region: 'baltic' },
  { locode: 'LVVNT', name: 'Ventspils', country: 'Latvia', countryCode: 'LV', lat: 57.39, lon: 21.55, portType: 'mixed', region: 'baltic' },
  { locode: 'LVLPX', name: 'Liepaja', country: 'Latvia', countryCode: 'LV', lat: 56.51, lon: 20.98, portType: 'mixed', region: 'baltic' },
  { locode: 'EETLL', name: 'Tallinn', country: 'Estonia', countryCode: 'EE', lat: 59.44, lon: 24.76, portType: 'container', region: 'baltic' },
  { locode: 'EEMUG', name: 'Muuga', country: 'Estonia', countryCode: 'EE', lat: 59.49, lon: 24.94, portType: 'mixed', region: 'baltic' },
  { locode: 'LTKLJ', name: 'Klaipeda', country: 'Lithuania', countryCode: 'LT', lat: 55.72, lon: 21.12, portType: 'container', region: 'baltic' },

  // --- Black Sea ---
  { locode: 'ROCND', name: 'Constanta', country: 'Romania', countryCode: 'RO', lat: 44.17, lon: 28.66, portType: 'container', region: 'black_sea' },
  { locode: 'UAODS', name: 'Odesa', country: 'Ukraine', countryCode: 'UA', lat: 46.49, lon: 30.74, portType: 'container', region: 'black_sea' },
  { locode: 'UAPIV', name: 'Pivdennyi (Yuzhny)', country: 'Ukraine', countryCode: 'UA', lat: 46.61, lon: 31.02, portType: 'bulk', region: 'black_sea' },
  { locode: 'UAILK', name: 'Illichivsk (Chornomorsk)', country: 'Ukraine', countryCode: 'UA', lat: 46.30, lon: 30.66, portType: 'container', region: 'black_sea' },
  { locode: 'RUNVS', name: 'Novorossiysk', country: 'Russia', countryCode: 'RU', lat: 44.72, lon: 37.77, portType: 'tanker', region: 'black_sea' },
  { locode: 'BGVAR', name: 'Varna', country: 'Bulgaria', countryCode: 'BG', lat: 43.20, lon: 27.92, portType: 'mixed', region: 'black_sea' },
  { locode: 'BGBOJ', name: 'Burgas', country: 'Bulgaria', countryCode: 'BG', lat: 42.49, lon: 27.47, portType: 'mixed', region: 'black_sea' },
  { locode: 'GEBAT', name: 'Batumi', country: 'Georgia', countryCode: 'GE', lat: 41.64, lon: 41.63, portType: 'tanker', region: 'black_sea' },
  { locode: 'GEPTI', name: 'Poti', country: 'Georgia', countryCode: 'GE', lat: 42.15, lon: 41.67, portType: 'container', region: 'black_sea' },

  // --- Russia (other) ---
  { locode: 'RULED', name: 'St. Petersburg', country: 'Russia', countryCode: 'RU', lat: 59.93, lon: 30.26, portType: 'container', region: 'baltic' },
  { locode: 'RUPRI', name: 'Primorsk', country: 'Russia', countryCode: 'RU', lat: 60.35, lon: 28.62, portType: 'tanker', region: 'baltic' },
  { locode: 'RUMMK', name: 'Murmansk', country: 'Russia', countryCode: 'RU', lat: 68.97, lon: 33.05, portType: 'mixed', region: 'arctic' },
  { locode: 'RUVVO', name: 'Vladivostok', country: 'Russia', countryCode: 'RU', lat: 43.12, lon: 131.88, portType: 'mixed', region: 'pacific' },
  { locode: 'RUVOS', name: 'Vostochny', country: 'Russia', countryCode: 'RU', lat: 42.75, lon: 133.07, portType: 'container', region: 'pacific' },
  { locode: 'RUNAK', name: 'Nakhodka', country: 'Russia', countryCode: 'RU', lat: 42.82, lon: 132.87, portType: 'mixed', region: 'pacific' },
  { locode: 'RUSAB', name: 'Sabetta', country: 'Russia', countryCode: 'RU', lat: 71.27, lon: 72.07, portType: 'lng', region: 'arctic' },
  { locode: 'RUUST', name: 'Ust-Luga', country: 'Russia', countryCode: 'RU', lat: 59.68, lon: 28.40, portType: 'mixed', region: 'baltic' },
  { locode: 'RUKMX', name: 'Kaliningrad', country: 'Russia', countryCode: 'RU', lat: 54.70, lon: 20.45, portType: 'mixed', region: 'baltic' },

  // --- Other Europe ---
  { locode: 'IEDUB', name: 'Dublin', country: 'Ireland', countryCode: 'IE', lat: 53.35, lon: -6.22, portType: 'container', region: 'atlantic_north' },
  { locode: 'IECOR', name: 'Cork', country: 'Ireland', countryCode: 'IE', lat: 51.84, lon: -8.29, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'HRRIC', name: 'Rijeka', country: 'Croatia', countryCode: 'HR', lat: 45.33, lon: 14.44, portType: 'mixed', region: 'mediterranean' },
  { locode: 'HRSPL', name: 'Split', country: 'Croatia', countryCode: 'HR', lat: 43.51, lon: 16.44, portType: 'general', region: 'mediterranean' },
  { locode: 'SIPKP', name: 'Koper', country: 'Slovenia', countryCode: 'SI', lat: 45.55, lon: 13.74, portType: 'container', region: 'mediterranean' },
  { locode: 'MEBAR', name: 'Bar', country: 'Montenegro', countryCode: 'ME', lat: 42.09, lon: 19.10, portType: 'mixed', region: 'mediterranean' },
  { locode: 'ALBRT', name: 'Durres', country: 'Albania', countryCode: 'AL', lat: 41.32, lon: 19.45, portType: 'general', region: 'mediterranean' },
  { locode: 'CYLMS', name: 'Limassol', country: 'Cyprus', countryCode: 'CY', lat: 34.67, lon: 33.04, portType: 'container', region: 'mediterranean' },
  { locode: 'MTMAR', name: 'Marsaxlokk', country: 'Malta', countryCode: 'MT', lat: 35.84, lon: 14.54, portType: 'container', region: 'mediterranean' },
  { locode: 'ISKEF', name: 'Reykjavik', country: 'Iceland', countryCode: 'IS', lat: 64.15, lon: -21.94, portType: 'mixed', region: 'atlantic_north' },

  // =========================================================================
  // AMERICAS (~150 ports)
  // =========================================================================

  // --- US East Coast ---
  { locode: 'USNYC', name: 'New York / New Jersey', country: 'USA', countryCode: 'US', lat: 40.67, lon: -74.04, portType: 'container', region: 'atlantic_north' },
  { locode: 'USSAV', name: 'Savannah', country: 'USA', countryCode: 'US', lat: 32.08, lon: -81.09, portType: 'container', region: 'atlantic_north' },
  { locode: 'USCHS', name: 'Charleston', country: 'USA', countryCode: 'US', lat: 32.81, lon: -79.95, portType: 'container', region: 'atlantic_north' },
  { locode: 'USNFK', name: 'Norfolk (Virginia)', country: 'USA', countryCode: 'US', lat: 36.95, lon: -76.33, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'USBAL', name: 'Baltimore', country: 'USA', countryCode: 'US', lat: 39.27, lon: -76.58, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'USBOS', name: 'Boston', country: 'USA', countryCode: 'US', lat: 42.35, lon: -71.04, portType: 'container', region: 'atlantic_north' },
  { locode: 'USPHL', name: 'Philadelphia', country: 'USA', countryCode: 'US', lat: 39.89, lon: -75.14, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'USMIA', name: 'Miami', country: 'USA', countryCode: 'US', lat: 25.77, lon: -80.17, portType: 'container', region: 'caribbean' },
  { locode: 'USJAX', name: 'Jacksonville', country: 'USA', countryCode: 'US', lat: 30.40, lon: -81.60, portType: 'container', region: 'atlantic_north' },
  { locode: 'USWPT', name: 'Wilmington (NC)', country: 'USA', countryCode: 'US', lat: 34.17, lon: -77.95, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'USBNR', name: 'Brunswick', country: 'USA', countryCode: 'US', lat: 31.15, lon: -81.49, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'USEVP', name: 'Port Everglades', country: 'USA', countryCode: 'US', lat: 26.09, lon: -80.12, portType: 'container', region: 'caribbean' },
  { locode: 'USNWH', name: 'New Haven', country: 'USA', countryCode: 'US', lat: 41.28, lon: -72.91, portType: 'mixed', region: 'atlantic_north' },

  // --- US Gulf Coast ---
  { locode: 'USHOU', name: 'Houston', country: 'USA', countryCode: 'US', lat: 29.73, lon: -95.02, portType: 'mixed', region: 'caribbean' },
  { locode: 'USMSY', name: 'New Orleans', country: 'USA', countryCode: 'US', lat: 29.93, lon: -90.05, portType: 'mixed', region: 'caribbean' },
  { locode: 'USMOB', name: 'Mobile', country: 'USA', countryCode: 'US', lat: 30.69, lon: -88.04, portType: 'mixed', region: 'caribbean' },
  { locode: 'USBPT', name: 'Beaumont', country: 'USA', countryCode: 'US', lat: 30.08, lon: -94.10, portType: 'tanker', region: 'caribbean' },
  { locode: 'USCCR', name: 'Corpus Christi', country: 'USA', countryCode: 'US', lat: 27.81, lon: -97.40, portType: 'tanker', region: 'caribbean' },
  { locode: 'USLCH', name: 'Lake Charles', country: 'USA', countryCode: 'US', lat: 30.22, lon: -93.22, portType: 'lng', region: 'caribbean' },
  { locode: 'USSPS', name: 'Sabine Pass', country: 'USA', countryCode: 'US', lat: 29.73, lon: -93.87, portType: 'lng', region: 'caribbean' },
  { locode: 'USPEN', name: 'Pensacola', country: 'USA', countryCode: 'US', lat: 30.41, lon: -87.21, portType: 'naval', region: 'caribbean' },
  { locode: 'USTPA', name: 'Tampa', country: 'USA', countryCode: 'US', lat: 27.94, lon: -82.45, portType: 'mixed', region: 'caribbean' },
  { locode: 'USGPT', name: 'Gulfport', country: 'USA', countryCode: 'US', lat: 30.37, lon: -89.09, portType: 'mixed', region: 'caribbean' },
  { locode: 'USFPX', name: 'Freeport (TX)', country: 'USA', countryCode: 'US', lat: 28.95, lon: -95.36, portType: 'tanker', region: 'caribbean' },

  // --- US West Coast ---
  { locode: 'USLAX', name: 'Los Angeles', country: 'USA', countryCode: 'US', lat: 33.73, lon: -118.26, portType: 'container', region: 'east_pacific' },
  { locode: 'USLGB', name: 'Long Beach', country: 'USA', countryCode: 'US', lat: 33.75, lon: -118.20, portType: 'container', region: 'east_pacific' },
  { locode: 'USOAK', name: 'Oakland', country: 'USA', countryCode: 'US', lat: 37.80, lon: -122.30, portType: 'container', region: 'east_pacific' },
  { locode: 'USSEA', name: 'Seattle', country: 'USA', countryCode: 'US', lat: 47.58, lon: -122.35, portType: 'container', region: 'east_pacific' },
  { locode: 'USTIW', name: 'Tacoma', country: 'USA', countryCode: 'US', lat: 47.27, lon: -122.42, portType: 'container', region: 'east_pacific' },
  { locode: 'USPOR', name: 'Portland', country: 'USA', countryCode: 'US', lat: 45.52, lon: -122.68, portType: 'mixed', region: 'east_pacific' },
  { locode: 'USSDO', name: 'San Diego', country: 'USA', countryCode: 'US', lat: 32.72, lon: -117.18, portType: 'naval', region: 'east_pacific' },
  { locode: 'USHNL', name: 'Honolulu', country: 'USA', countryCode: 'US', lat: 21.31, lon: -157.86, portType: 'mixed', region: 'east_pacific' },
  { locode: 'USANC', name: 'Anchorage', country: 'USA', countryCode: 'US', lat: 61.22, lon: -149.89, portType: 'mixed', region: 'east_pacific' },

  // --- Canada ---
  { locode: 'CAVAN', name: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.29, lon: -123.11, portType: 'container', region: 'east_pacific' },
  { locode: 'CAMTR', name: 'Montreal', country: 'Canada', countryCode: 'CA', lat: 45.50, lon: -73.55, portType: 'container', region: 'atlantic_north' },
  { locode: 'CAHAL', name: 'Halifax', country: 'Canada', countryCode: 'CA', lat: 44.64, lon: -63.57, portType: 'container', region: 'atlantic_north' },
  { locode: 'CAPRR', name: 'Prince Rupert', country: 'Canada', countryCode: 'CA', lat: 54.31, lon: -130.32, portType: 'container', region: 'east_pacific' },
  { locode: 'CATOR', name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.64, lon: -79.38, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'CASJO', name: 'Saint John', country: 'Canada', countryCode: 'CA', lat: 45.27, lon: -66.06, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'CAQUE', name: 'Quebec City', country: 'Canada', countryCode: 'CA', lat: 46.81, lon: -71.21, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'CANWP', name: 'New Westminster', country: 'Canada', countryCode: 'CA', lat: 49.20, lon: -122.91, portType: 'mixed', region: 'east_pacific' },

  // --- Mexico ---
  { locode: 'MXZLO', name: 'Manzanillo', country: 'Mexico', countryCode: 'MX', lat: 19.05, lon: -104.32, portType: 'container', region: 'east_pacific' },
  { locode: 'MXLZC', name: 'Lazaro Cardenas', country: 'Mexico', countryCode: 'MX', lat: 17.94, lon: -102.18, portType: 'mixed', region: 'east_pacific' },
  { locode: 'MXVER', name: 'Veracruz', country: 'Mexico', countryCode: 'MX', lat: 19.20, lon: -96.13, portType: 'mixed', region: 'caribbean' },
  { locode: 'MXATM', name: 'Altamira', country: 'Mexico', countryCode: 'MX', lat: 22.40, lon: -97.91, portType: 'mixed', region: 'caribbean' },
  { locode: 'MXPRO', name: 'Progreso', country: 'Mexico', countryCode: 'MX', lat: 21.28, lon: -89.66, portType: 'general', region: 'caribbean' },
  { locode: 'MXESE', name: 'Ensenada', country: 'Mexico', countryCode: 'MX', lat: 31.87, lon: -116.60, portType: 'mixed', region: 'east_pacific' },
  { locode: 'MXDOS', name: 'Dos Bocas', country: 'Mexico', countryCode: 'MX', lat: 18.43, lon: -93.20, portType: 'tanker', region: 'caribbean' },

  // --- Brazil ---
  { locode: 'BRSSZ', name: 'Santos', country: 'Brazil', countryCode: 'BR', lat: -23.95, lon: -46.30, portType: 'container', region: 'atlantic_south' },
  { locode: 'BRPNG', name: 'Paranagua', country: 'Brazil', countryCode: 'BR', lat: -25.52, lon: -48.52, portType: 'bulk', region: 'atlantic_south' },
  { locode: 'BRRGI', name: 'Rio Grande', country: 'Brazil', countryCode: 'BR', lat: -32.05, lon: -52.10, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'BRITQ', name: 'Itaqui (Sao Luis)', country: 'Brazil', countryCode: 'BR', lat: -2.57, lon: -44.37, portType: 'bulk', region: 'atlantic_south' },
  { locode: 'BRREC', name: 'Recife (Suape)', country: 'Brazil', countryCode: 'BR', lat: -8.39, lon: -35.06, portType: 'container', region: 'atlantic_south' },
  { locode: 'BRSSB', name: 'Sao Sebastiao', country: 'Brazil', countryCode: 'BR', lat: -23.82, lon: -45.41, portType: 'tanker', region: 'atlantic_south' },
  { locode: 'BRVIX', name: 'Vitoria (Tubarao)', country: 'Brazil', countryCode: 'BR', lat: -20.30, lon: -40.29, portType: 'bulk', region: 'atlantic_south' },
  { locode: 'BRRIO', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', lat: -22.90, lon: -43.17, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'BRSSF', name: 'Sao Francisco do Sul', country: 'Brazil', countryCode: 'BR', lat: -26.24, lon: -48.63, portType: 'bulk', region: 'atlantic_south' },
  { locode: 'BRITA', name: 'Itajai (Navegantes)', country: 'Brazil', countryCode: 'BR', lat: -26.91, lon: -48.67, portType: 'container', region: 'atlantic_south' },
  { locode: 'BRSSA', name: 'Salvador', country: 'Brazil', countryCode: 'BR', lat: -12.97, lon: -38.51, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'BRFOR', name: 'Fortaleza (Pecem)', country: 'Brazil', countryCode: 'BR', lat: -3.54, lon: -38.81, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'BRMAO', name: 'Manaus', country: 'Brazil', countryCode: 'BR', lat: -3.12, lon: -60.02, portType: 'mixed', region: 'atlantic_south' },

  // --- Argentina ---
  { locode: 'ARBUE', name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', lat: -34.61, lon: -58.37, portType: 'container', region: 'atlantic_south' },
  { locode: 'ARROS', name: 'Rosario', country: 'Argentina', countryCode: 'AR', lat: -32.95, lon: -60.65, portType: 'bulk', region: 'atlantic_south' },
  { locode: 'ARBBW', name: 'Bahia Blanca', country: 'Argentina', countryCode: 'AR', lat: -38.72, lon: -62.27, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'ARSFE', name: 'San Lorenzo (Santa Fe)', country: 'Argentina', countryCode: 'AR', lat: -32.74, lon: -60.73, portType: 'bulk', region: 'atlantic_south' },
  { locode: 'ARUSH', name: 'Ushuaia', country: 'Argentina', countryCode: 'AR', lat: -54.80, lon: -68.30, portType: 'general', region: 'atlantic_south' },

  // --- Chile ---
  { locode: 'CLSAI', name: 'San Antonio', country: 'Chile', countryCode: 'CL', lat: -33.59, lon: -71.62, portType: 'container', region: 'east_pacific' },
  { locode: 'CLVAP', name: 'Valparaiso', country: 'Chile', countryCode: 'CL', lat: -33.05, lon: -71.63, portType: 'container', region: 'east_pacific' },
  { locode: 'CLSVE', name: 'San Vicente (Talcahuano)', country: 'Chile', countryCode: 'CL', lat: -36.73, lon: -73.13, portType: 'mixed', region: 'east_pacific' },
  { locode: 'CLIQQ', name: 'Iquique', country: 'Chile', countryCode: 'CL', lat: -20.21, lon: -70.14, portType: 'mixed', region: 'east_pacific' },
  { locode: 'CLARI', name: 'Arica', country: 'Chile', countryCode: 'CL', lat: -18.47, lon: -70.33, portType: 'general', region: 'east_pacific' },
  { locode: 'CLPAG', name: 'Puerto Angamos', country: 'Chile', countryCode: 'CL', lat: -23.10, lon: -70.47, portType: 'bulk', region: 'east_pacific' },

  // --- Colombia ---
  { locode: 'COCTG', name: 'Cartagena', country: 'Colombia', countryCode: 'CO', lat: 10.40, lon: -75.52, portType: 'container', region: 'caribbean' },
  { locode: 'COBUN', name: 'Buenaventura', country: 'Colombia', countryCode: 'CO', lat: 3.88, lon: -77.04, portType: 'container', region: 'east_pacific' },
  { locode: 'COBAQ', name: 'Barranquilla', country: 'Colombia', countryCode: 'CO', lat: 10.96, lon: -74.78, portType: 'mixed', region: 'caribbean' },
  { locode: 'COSMT', name: 'Santa Marta', country: 'Colombia', countryCode: 'CO', lat: 11.24, lon: -74.20, portType: 'mixed', region: 'caribbean' },

  // --- Panama ---
  { locode: 'PABLB', name: 'Balboa', country: 'Panama', countryCode: 'PA', lat: 8.95, lon: -79.56, portType: 'container', region: 'east_pacific' },
  { locode: 'PACTB', name: 'Cristobal (Colon)', country: 'Panama', countryCode: 'PA', lat: 9.35, lon: -79.90, portType: 'container', region: 'caribbean' },
  { locode: 'PAONX', name: 'Colon (MIT)', country: 'Panama', countryCode: 'PA', lat: 9.36, lon: -79.88, portType: 'container', region: 'caribbean' },
  { locode: 'PAMIT', name: 'Manzanillo International Terminal', country: 'Panama', countryCode: 'PA', lat: 9.35, lon: -79.91, portType: 'container', region: 'caribbean' },

  // --- Peru ---
  { locode: 'PECLL', name: 'Callao', country: 'Peru', countryCode: 'PE', lat: -12.05, lon: -77.14, portType: 'container', region: 'east_pacific' },
  { locode: 'PEPIO', name: 'Paita', country: 'Peru', countryCode: 'PE', lat: -5.09, lon: -81.11, portType: 'mixed', region: 'east_pacific' },
  { locode: 'PEILO', name: 'Ilo', country: 'Peru', countryCode: 'PE', lat: -17.64, lon: -71.34, portType: 'mixed', region: 'east_pacific' },

  // --- Ecuador ---
  { locode: 'ECGYE', name: 'Guayaquil', country: 'Ecuador', countryCode: 'EC', lat: -2.19, lon: -79.89, portType: 'container', region: 'east_pacific' },
  { locode: 'ECESM', name: 'Esmeraldas', country: 'Ecuador', countryCode: 'EC', lat: 0.96, lon: -79.65, portType: 'tanker', region: 'east_pacific' },
  { locode: 'ECMTA', name: 'Manta', country: 'Ecuador', countryCode: 'EC', lat: -0.95, lon: -80.73, portType: 'mixed', region: 'east_pacific' },

  // --- Venezuela ---
  { locode: 'VEPBL', name: 'Puerto Cabello', country: 'Venezuela', countryCode: 'VE', lat: 10.47, lon: -68.01, portType: 'container', region: 'caribbean' },
  { locode: 'VELAG', name: 'La Guaira', country: 'Venezuela', countryCode: 'VE', lat: 10.60, lon: -66.93, portType: 'mixed', region: 'caribbean' },
  { locode: 'VEMCB', name: 'Maracaibo', country: 'Venezuela', countryCode: 'VE', lat: 10.67, lon: -71.62, portType: 'tanker', region: 'caribbean' },
  { locode: 'VEJSC', name: 'Jose (Anzoategui)', country: 'Venezuela', countryCode: 'VE', lat: 10.14, lon: -65.25, portType: 'tanker', region: 'caribbean' },

  // --- Uruguay ---
  { locode: 'UYMVD', name: 'Montevideo', country: 'Uruguay', countryCode: 'UY', lat: -34.88, lon: -56.21, portType: 'container', region: 'atlantic_south' },
  { locode: 'UYNVP', name: 'Nueva Palmira', country: 'Uruguay', countryCode: 'UY', lat: -33.88, lon: -58.42, portType: 'bulk', region: 'atlantic_south' },

  // --- Caribbean ---
  { locode: 'DOHAI', name: 'Haina', country: 'Dominican Republic', countryCode: 'DO', lat: 18.42, lon: -70.01, portType: 'container', region: 'caribbean' },
  { locode: 'DOCAU', name: 'Caucedo', country: 'Dominican Republic', countryCode: 'DO', lat: 18.43, lon: -69.63, portType: 'container', region: 'caribbean' },
  { locode: 'JMKIN', name: 'Kingston', country: 'Jamaica', countryCode: 'JM', lat: 17.97, lon: -76.79, portType: 'container', region: 'caribbean' },
  { locode: 'TTPOS', name: 'Port of Spain', country: 'Trinidad and Tobago', countryCode: 'TT', lat: 10.65, lon: -61.52, portType: 'mixed', region: 'caribbean' },
  { locode: 'TTPTL', name: 'Point Lisas', country: 'Trinidad and Tobago', countryCode: 'TT', lat: 10.40, lon: -61.48, portType: 'mixed', region: 'caribbean' },
  { locode: 'BSFPO', name: 'Freeport', country: 'Bahamas', countryCode: 'BS', lat: 26.53, lon: -78.70, portType: 'container', region: 'caribbean' },
  { locode: 'CUBHA', name: 'Havana', country: 'Cuba', countryCode: 'CU', lat: 23.13, lon: -82.35, portType: 'mixed', region: 'caribbean' },
  { locode: 'CUSNT', name: 'Santiago de Cuba', country: 'Cuba', countryCode: 'CU', lat: 20.01, lon: -75.82, portType: 'mixed', region: 'caribbean' },
  { locode: 'PRSJN', name: 'San Juan', country: 'Puerto Rico', countryCode: 'PR', lat: 18.46, lon: -66.11, portType: 'container', region: 'caribbean' },
  { locode: 'GPBBR', name: 'Pointe-a-Pitre', country: 'Guadeloupe', countryCode: 'GP', lat: 16.24, lon: -61.53, portType: 'general', region: 'caribbean' },
  { locode: 'HTPAP', name: 'Port-au-Prince', country: 'Haiti', countryCode: 'HT', lat: 18.54, lon: -72.34, portType: 'general', region: 'caribbean' },

  // --- Central America ---
  { locode: 'GTPRQ', name: 'Puerto Quetzal', country: 'Guatemala', countryCode: 'GT', lat: 13.93, lon: -90.79, portType: 'mixed', region: 'east_pacific' },
  { locode: 'GTSTC', name: 'Santo Tomas de Castilla', country: 'Guatemala', countryCode: 'GT', lat: 15.70, lon: -88.62, portType: 'container', region: 'caribbean' },
  { locode: 'HNPCR', name: 'Puerto Cortes', country: 'Honduras', countryCode: 'HN', lat: 15.83, lon: -87.95, portType: 'container', region: 'caribbean' },
  { locode: 'CRLIM', name: 'Puerto Limon', country: 'Costa Rica', countryCode: 'CR', lat: 10.00, lon: -83.03, portType: 'mixed', region: 'caribbean' },
  { locode: 'CRCAL', name: 'Caldera', country: 'Costa Rica', countryCode: 'CR', lat: 9.92, lon: -84.72, portType: 'mixed', region: 'east_pacific' },

  // --- Guyana/Suriname ---
  { locode: 'GYGEO', name: 'Georgetown', country: 'Guyana', countryCode: 'GY', lat: 6.80, lon: -58.16, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'SRPBM', name: 'Paramaribo', country: 'Suriname', countryCode: 'SR', lat: 5.82, lon: -55.17, portType: 'general', region: 'atlantic_south' },

  // =========================================================================
  // AFRICA (~100 ports)
  // =========================================================================

  // --- Egypt ---
  { locode: 'EGPSD', name: 'Port Said', country: 'Egypt', countryCode: 'EG', lat: 31.26, lon: 32.30, portType: 'container', region: 'mediterranean' },
  { locode: 'EGSUZ', name: 'Suez', country: 'Egypt', countryCode: 'EG', lat: 29.97, lon: 32.55, portType: 'mixed', region: 'red_sea' },
  { locode: 'EGALY', name: 'Alexandria', country: 'Egypt', countryCode: 'EG', lat: 31.20, lon: 29.92, portType: 'container', region: 'mediterranean' },
  { locode: 'EGAIS', name: 'Ain Sokhna', country: 'Egypt', countryCode: 'EG', lat: 29.60, lon: 32.33, portType: 'container', region: 'red_sea' },
  { locode: 'EGDAM', name: 'Damietta', country: 'Egypt', countryCode: 'EG', lat: 31.42, lon: 31.81, portType: 'container', region: 'mediterranean' },
  { locode: 'EGSKT', name: 'East Port Said', country: 'Egypt', countryCode: 'EG', lat: 31.24, lon: 32.37, portType: 'container', region: 'mediterranean' },

  // --- Morocco ---
  { locode: 'MATNG', name: 'Tanger Med', country: 'Morocco', countryCode: 'MA', lat: 35.89, lon: -5.49, portType: 'container', region: 'mediterranean' },
  { locode: 'MACAS', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.60, lon: -7.62, portType: 'container', region: 'atlantic_north' },
  { locode: 'MAAGA', name: 'Agadir', country: 'Morocco', countryCode: 'MA', lat: 30.43, lon: -9.64, portType: 'mixed', region: 'atlantic_north' },
  { locode: 'MAJOR', name: 'Jorf Lasfar', country: 'Morocco', countryCode: 'MA', lat: 33.12, lon: -8.63, portType: 'bulk', region: 'atlantic_north' },
  { locode: 'MAMOH', name: 'Mohammedia', country: 'Morocco', countryCode: 'MA', lat: 33.72, lon: -7.39, portType: 'tanker', region: 'atlantic_north' },
  { locode: 'MANAK', name: 'Nador', country: 'Morocco', countryCode: 'MA', lat: 35.28, lon: -2.93, portType: 'mixed', region: 'mediterranean' },

  // --- South Africa ---
  { locode: 'ZADUR', name: 'Durban', country: 'South Africa', countryCode: 'ZA', lat: -29.87, lon: 31.03, portType: 'container', region: 'indian_ocean' },
  { locode: 'ZACPT', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.92, lon: 18.43, portType: 'container', region: 'atlantic_south' },
  { locode: 'ZARCB', name: 'Richards Bay', country: 'South Africa', countryCode: 'ZA', lat: -28.80, lon: 32.08, portType: 'bulk', region: 'indian_ocean' },
  { locode: 'ZANGQ', name: 'Ngqura (Coega)', country: 'South Africa', countryCode: 'ZA', lat: -33.80, lon: 25.68, portType: 'container', region: 'indian_ocean' },
  { locode: 'ZAPEL', name: 'Port Elizabeth', country: 'South Africa', countryCode: 'ZA', lat: -33.96, lon: 25.63, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'ZAELS', name: 'East London', country: 'South Africa', countryCode: 'ZA', lat: -33.03, lon: 27.91, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'ZASAL', name: 'Saldanha Bay', country: 'South Africa', countryCode: 'ZA', lat: -33.00, lon: 17.93, portType: 'bulk', region: 'atlantic_south' },

  // --- Nigeria ---
  { locode: 'NGAPP', name: 'Lagos (Apapa)', country: 'Nigeria', countryCode: 'NG', lat: 6.44, lon: 3.37, portType: 'container', region: 'atlantic_south' },
  { locode: 'NGLEK', name: 'Lekki Deep Sea Port', country: 'Nigeria', countryCode: 'NG', lat: 6.39, lon: 3.55, portType: 'container', region: 'atlantic_south' },
  { locode: 'NGONN', name: 'Onne', country: 'Nigeria', countryCode: 'NG', lat: 4.72, lon: 7.15, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'NGTIN', name: 'Tin Can Island', country: 'Nigeria', countryCode: 'NG', lat: 6.43, lon: 3.35, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'NGPHC', name: 'Port Harcourt', country: 'Nigeria', countryCode: 'NG', lat: 4.77, lon: 7.01, portType: 'tanker', region: 'atlantic_south' },
  { locode: 'NGBON', name: 'Bonny', country: 'Nigeria', countryCode: 'NG', lat: 4.44, lon: 7.17, portType: 'lng', region: 'atlantic_south' },
  { locode: 'NGCAL', name: 'Calabar', country: 'Nigeria', countryCode: 'NG', lat: 4.96, lon: 8.33, portType: 'general', region: 'atlantic_south' },

  // --- Kenya ---
  { locode: 'KEMBA', name: 'Mombasa', country: 'Kenya', countryCode: 'KE', lat: -4.04, lon: 39.67, portType: 'container', region: 'indian_ocean' },

  // --- Tanzania ---
  { locode: 'TZDAR', name: 'Dar es Salaam', country: 'Tanzania', countryCode: 'TZ', lat: -6.83, lon: 39.29, portType: 'container', region: 'indian_ocean' },
  { locode: 'TZBAG', name: 'Bagamoyo', country: 'Tanzania', countryCode: 'TZ', lat: -6.44, lon: 38.90, portType: 'mixed', region: 'indian_ocean' },

  // --- Mozambique ---
  { locode: 'MZMPM', name: 'Maputo', country: 'Mozambique', countryCode: 'MZ', lat: -25.97, lon: 32.58, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'MZBEW', name: 'Beira', country: 'Mozambique', countryCode: 'MZ', lat: -19.84, lon: 34.87, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'MZMNC', name: 'Nacala', country: 'Mozambique', countryCode: 'MZ', lat: -14.54, lon: 40.69, portType: 'mixed', region: 'indian_ocean' },

  // --- Ghana ---
  { locode: 'GHTEM', name: 'Tema', country: 'Ghana', countryCode: 'GH', lat: 5.63, lon: -0.02, portType: 'container', region: 'atlantic_south' },
  { locode: 'GHTKD', name: 'Takoradi', country: 'Ghana', countryCode: 'GH', lat: 4.90, lon: -1.75, portType: 'mixed', region: 'atlantic_south' },

  // --- Ivory Coast ---
  { locode: 'CIABJ', name: 'Abidjan', country: 'Ivory Coast', countryCode: 'CI', lat: 5.30, lon: -4.01, portType: 'container', region: 'atlantic_south' },
  { locode: 'CISPY', name: 'San Pedro', country: 'Ivory Coast', countryCode: 'CI', lat: 4.75, lon: -6.64, portType: 'mixed', region: 'atlantic_south' },

  // --- Senegal ---
  { locode: 'SNDKR', name: 'Dakar', country: 'Senegal', countryCode: 'SN', lat: 14.69, lon: -17.44, portType: 'container', region: 'atlantic_south' },

  // --- Djibouti ---
  { locode: 'DJJIB', name: 'Djibouti', country: 'Djibouti', countryCode: 'DJ', lat: 11.59, lon: 43.15, portType: 'mixed', region: 'red_sea' },
  { locode: 'DJDRL', name: 'Doraleh', country: 'Djibouti', countryCode: 'DJ', lat: 11.55, lon: 43.07, portType: 'container', region: 'red_sea' },

  // --- Sudan ---
  { locode: 'SDPZU', name: 'Port Sudan', country: 'Sudan', countryCode: 'SD', lat: 19.62, lon: 37.22, portType: 'mixed', region: 'red_sea' },

  // --- Eritrea ---
  { locode: 'ERASS', name: 'Assab', country: 'Eritrea', countryCode: 'ER', lat: 13.01, lon: 42.74, portType: 'general', region: 'red_sea' },
  { locode: 'ERMSW', name: 'Massawa', country: 'Eritrea', countryCode: 'ER', lat: 15.61, lon: 39.47, portType: 'general', region: 'red_sea' },

  // --- Libya ---
  { locode: 'LYTIP', name: 'Tripoli', country: 'Libya', countryCode: 'LY', lat: 32.90, lon: 13.18, portType: 'mixed', region: 'mediterranean' },
  { locode: 'LYMRA', name: 'Misrata', country: 'Libya', countryCode: 'LY', lat: 32.38, lon: 15.09, portType: 'mixed', region: 'mediterranean' },
  { locode: 'LYBEN', name: 'Benghazi', country: 'Libya', countryCode: 'LY', lat: 32.12, lon: 20.07, portType: 'mixed', region: 'mediterranean' },
  { locode: 'LYBTH', name: 'Brega (Marsa el Brega)', country: 'Libya', countryCode: 'LY', lat: 30.41, lon: 19.58, portType: 'tanker', region: 'mediterranean' },
  { locode: 'LYESI', name: 'Es Sider', country: 'Libya', countryCode: 'LY', lat: 30.63, lon: 18.35, portType: 'tanker', region: 'mediterranean' },

  // --- Algeria ---
  { locode: 'DZALG', name: 'Algiers', country: 'Algeria', countryCode: 'DZ', lat: 36.77, lon: 3.06, portType: 'mixed', region: 'mediterranean' },
  { locode: 'DZORN', name: 'Oran', country: 'Algeria', countryCode: 'DZ', lat: 35.72, lon: -0.63, portType: 'mixed', region: 'mediterranean' },
  { locode: 'DZSKE', name: 'Skikda', country: 'Algeria', countryCode: 'DZ', lat: 36.88, lon: 6.90, portType: 'lng', region: 'mediterranean' },
  { locode: 'DZARZ', name: 'Arzew', country: 'Algeria', countryCode: 'DZ', lat: 35.85, lon: -0.30, portType: 'lng', region: 'mediterranean' },
  { locode: 'DZBJA', name: 'Bejaia', country: 'Algeria', countryCode: 'DZ', lat: 36.75, lon: 5.08, portType: 'mixed', region: 'mediterranean' },
  { locode: 'DZANN', name: 'Annaba', country: 'Algeria', countryCode: 'DZ', lat: 36.90, lon: 7.77, portType: 'mixed', region: 'mediterranean' },

  // --- Tunisia ---
  { locode: 'TNRAD', name: 'Rades', country: 'Tunisia', countryCode: 'TN', lat: 36.77, lon: 10.27, portType: 'container', region: 'mediterranean' },
  { locode: 'TNSFA', name: 'Sfax', country: 'Tunisia', countryCode: 'TN', lat: 34.74, lon: 10.76, portType: 'mixed', region: 'mediterranean' },
  { locode: 'TNBIZ', name: 'Bizerte', country: 'Tunisia', countryCode: 'TN', lat: 37.28, lon: 9.87, portType: 'mixed', region: 'mediterranean' },

  // --- Other Africa ---
  { locode: 'MGHLV', name: 'Toamasina', country: 'Madagascar', countryCode: 'MG', lat: -18.15, lon: 49.41, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'MUPLU', name: 'Port Louis', country: 'Mauritius', countryCode: 'MU', lat: -20.16, lon: 57.50, portType: 'container', region: 'indian_ocean' },
  { locode: 'REVIC', name: 'Le Port (Reunion)', country: 'Reunion', countryCode: 'RE', lat: -20.94, lon: 55.29, portType: 'mixed', region: 'indian_ocean' },
  { locode: 'AOMSZ', name: 'Luanda', country: 'Angola', countryCode: 'AO', lat: -8.84, lon: 13.23, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'AOLOB', name: 'Lobito', country: 'Angola', countryCode: 'AO', lat: -12.35, lon: 13.55, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'NAWAL', name: 'Walvis Bay', country: 'Namibia', countryCode: 'NA', lat: -22.96, lon: 14.50, portType: 'container', region: 'atlantic_south' },
  { locode: 'CDMAT', name: 'Matadi', country: 'DR Congo', countryCode: 'CD', lat: -5.82, lon: 13.46, portType: 'general', region: 'atlantic_south' },
  { locode: 'CGPNR', name: 'Pointe-Noire', country: 'Congo', countryCode: 'CG', lat: -4.80, lon: 11.83, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'CMDLE', name: 'Douala', country: 'Cameroon', countryCode: 'CM', lat: 4.05, lon: 9.70, portType: 'container', region: 'atlantic_south' },
  { locode: 'GQLSV', name: 'Malabo', country: 'Equatorial Guinea', countryCode: 'GQ', lat: 3.75, lon: 8.78, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'GALBV', name: 'Libreville', country: 'Gabon', countryCode: 'GA', lat: 0.38, lon: 9.45, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'TGLFW', name: 'Lome', country: 'Togo', countryCode: 'TG', lat: 6.14, lon: 1.29, portType: 'container', region: 'atlantic_south' },
  { locode: 'BJCOT', name: 'Cotonou', country: 'Benin', countryCode: 'BJ', lat: 6.35, lon: 2.43, portType: 'container', region: 'atlantic_south' },
  { locode: 'GNCON', name: 'Conakry', country: 'Guinea', countryCode: 'GN', lat: 9.51, lon: -13.71, portType: 'mixed', region: 'atlantic_south' },
  { locode: 'SLFNA', name: 'Freetown', country: 'Sierra Leone', countryCode: 'SL', lat: 8.48, lon: -13.23, portType: 'general', region: 'atlantic_south' },
  { locode: 'LRMLW', name: 'Monrovia', country: 'Liberia', countryCode: 'LR', lat: 6.33, lon: -10.80, portType: 'general', region: 'atlantic_south' },
  { locode: 'MRNKC', name: 'Nouakchott', country: 'Mauritania', countryCode: 'MR', lat: 18.07, lon: -15.99, portType: 'general', region: 'atlantic_south' },
  { locode: 'GMBJL', name: 'Banjul', country: 'Gambia', countryCode: 'GM', lat: 13.45, lon: -16.58, portType: 'general', region: 'atlantic_south' },
  { locode: 'SOMOQ', name: 'Mogadishu', country: 'Somalia', countryCode: 'SO', lat: 2.05, lon: 45.32, portType: 'general', region: 'indian_ocean' },
  { locode: 'SOBER', name: 'Berbera', country: 'Somalia (Somaliland)', countryCode: 'SO', lat: 10.44, lon: 45.02, portType: 'mixed', region: 'red_sea' },
];

// ---------------------------------------------------------------------------
// Lookup Indexes (built once on first access)
// ---------------------------------------------------------------------------

let _locodeIndex: Map<string, Port> | null = null;
let _regionIndex: Map<string, Port[]> | null = null;

function getLocodeIndex(): Map<string, Port> {
  if (!_locodeIndex) {
    _locodeIndex = new Map();
    for (const port of PORTS) {
      _locodeIndex.set(port.locode.toUpperCase(), port);
    }
  }
  return _locodeIndex;
}

function getRegionIndex(): Map<string, Port[]> {
  if (!_regionIndex) {
    _regionIndex = new Map();
    for (const port of PORTS) {
      const list = _regionIndex.get(port.region);
      if (list) {
        list.push(port);
      } else {
        _regionIndex.set(port.region, [port]);
      }
    }
  }
  return _regionIndex;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search ports by name, country, or LOCODE. Case-insensitive.
 * Returns up to `limit` results (default 20).
 */
export function searchPorts(query: string, limit = 20): Port[] {
  const q = query.toUpperCase().trim();
  if (!q) return [];

  const results: Port[] = [];

  // Exact LOCODE match first
  const exact = getLocodeIndex().get(q);
  if (exact) {
    results.push(exact);
  }

  // Then prefix/substring matches
  for (const port of PORTS) {
    if (results.length >= limit) break;
    if (port === exact) continue; // skip already-added exact match

    const nameUpper = port.name.toUpperCase();
    const countryUpper = port.country.toUpperCase();
    const locodeUpper = port.locode.toUpperCase();

    if (
      locodeUpper.includes(q) ||
      nameUpper.includes(q) ||
      countryUpper.includes(q)
    ) {
      results.push(port);
    }
  }

  return results.slice(0, limit);
}

/**
 * Look up a port by its UN/LOCODE. Case-insensitive.
 */
export function getPortByLocode(locode: string): Port | undefined {
  return getLocodeIndex().get(locode.toUpperCase());
}

/**
 * Get all ports in a given ocean region.
 */
export function getPortsByRegion(region: string): Port[] {
  return getRegionIndex().get(region) ?? [];
}

/**
 * Resolve messy AIS destination text to a port.
 *
 * AIS destinations are free-text and wildly inconsistent:
 *   "SINGAPORE", "SG SIN", "SGSIN", "ROTT", "NL RTM", ">>USH NY<<"
 *
 * Strategy: clean string → exact LOCODE → country+port pattern → substring search → first-word fallback
 */
export function resolveAisDestination(destStr: string): Port | null {
  if (!destStr) return null;
  // Strip non-alphanumeric (keep spaces), uppercase, trim
  const clean = destStr.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().trim();
  if (!clean || clean.length < 2) return null;

  const idx = getLocodeIndex();

  // 1. Try exact LOCODE (compacted — "SG SIN" → "SGSIN")
  const compacted = clean.replace(/\s+/g, '');
  const exactLocode = idx.get(compacted);
  if (exactLocode) return exactLocode;

  // 2. Try country+port pattern — "NL RTM" → "NLRTM"
  const parts = clean.split(/\s+/);
  if (parts.length >= 2 && parts[0]!.length === 2) {
    const candidate = parts[0]! + parts.slice(1).join('');
    const byPattern = idx.get(candidate);
    if (byPattern) return byPattern;
  }

  // 3. Substring search via searchPorts
  const results = searchPorts(clean, 1);
  if (results.length > 0) return results[0]!;

  // 4. Multi-word fallback: try first word only (e.g. "ROTTERDAM EUROPOORT" → "ROTTERDAM")
  if (parts.length > 1) {
    const firstWordResults = searchPorts(parts[0]!, 1);
    if (firstWordResults.length > 0) return firstWordResults[0]!;
  }

  return null;
}

/**
 * Find the nearest port to a given lat/lon within a max distance (nm).
 * Uses haversine approximation. Returns null if no port within maxDistanceNm.
 */
export function findNearestPort(lat: number, lon: number, maxDistanceNm = 30): Port | null {
  const toRad = Math.PI / 180;
  const lat1 = lat * toRad;
  let best: Port | null = null;
  let bestDist = Infinity;
  for (const p of PORTS) {
    const lat2 = p.lat * toRad;
    const dLat = lat2 - lat1;
    const dLon = (p.lon - lon) * toRad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const nm = 2 * Math.asin(Math.sqrt(a)) * 3440.065; // Earth radius in nm
    if (nm < bestDist) {
      bestDist = nm;
      best = p;
    }
  }
  return bestDist <= maxDistanceNm ? best : null;
}
