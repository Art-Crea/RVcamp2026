/* =========================================================
   rv_data.js — 別府國盗リ合戦 共通データ
   25陣所（Google Places 実座標）／ 三十六将 ／ 家紋・兜SVG
   ※ SVG内に <text> は一切置かない＝文字とアイコンは原理的に重ならない
   ========================================================= */

const DEFAULT_CP = [
  {name:"別府駅（出陣の地）",        lat:33.279240, lng:131.500860, hint:"駅前に立つ「別府観光の父」の銅像。両手を挙げた人物は誰？", flag:"⛩", conf:"確定", pt:40,  sensor:"NFCタッチ"},
  {name:"竹瓦温泉",                 lat:33.277456, lng:131.505989, hint:"名物の砂湯。受付で砂の温度を聞け", flag:"♨", conf:"確定", pt:80,  sensor:"NFCタッチ"},
  {name:"竹瓦小路アーケード",         lat:33.277033, lng:131.505911, hint:"日本最古級の木造アーケード。何造り？", flag:"🏮", conf:"確定"},
  {name:"別府タワー",               lat:33.281771, lng:131.505917, hint:"展望階は何階？", flag:"🗼", conf:"確定", pt:60,  sensor:"GPS"},
  {name:"別府公園",                 lat:33.281557, lng:131.491006, hint:"園内の竹林で一枚。合言葉を探せ", flag:"🌳", conf:"確定", pt:50,  sensor:"GPS"},
  {name:"別府市役所",               lat:33.284492, lng:131.491173, hint:"別府市の市の花は？", flag:"🏛", conf:"候補"},
  {name:"浜脇温泉",                 lat:33.269986, lng:131.508196, hint:"別府八湯最古。何時代から湧く？", flag:"♨", conf:"確定", pt:70,  sensor:"NFCタッチ"},
  {name:"別府ラクテンチ",            lat:33.274941, lng:131.485536, hint:"名物レース。何の動物が走る？", flag:"🎡", conf:"確定"},
  {name:"杉乃井ホテル（観海寺温泉）",  lat:33.284250, lng:131.473929, hint:"棚湯から見える湾の名は？", flag:"♨", conf:"確定", pt:150, sensor:"GPS+写真AI", kaname:true},
  {name:"堀田温泉",                 lat:33.275500, lng:131.459300, hint:"別府八湯のひとつ。入浴料は？", flag:"♨", conf:"候補", pt:70,  sensor:"NFCタッチ"},
  {name:"別府ロープウェイ",           lat:33.277901, lng:131.448759, hint:"山頂までの所要は約何分？", flag:"🚡", conf:"確定"},
  {name:"鶴見山上権現（鶴見岳山頂）",  lat:33.285961, lng:131.429952, hint:"鶴見岳の標高は？", flag:"⛩", conf:"確定", pt:200, sensor:"GPS+写真"},
  {name:"志高湖",                   lat:33.262000, lng:131.444800, hint:"湖畔のボートは何の鳥の形？", flag:"🏕", conf:"候補"},
  {name:"城島高原パーク",            lat:33.264275, lng:131.426807, hint:"木製コースターの名は？", flag:"🎢", conf:"候補"},
  {name:"明礬温泉 湯の里",           lat:33.319630, lng:131.453800, hint:"湯の花の結晶は何色？", flag:"♨", conf:"確定", pt:100, sensor:"音響トリガー"},
  {name:"湯の花小屋",               lat:33.317978, lng:131.452513, hint:"国指定の何文化財？", flag:"🏚", conf:"確定"},
  {name:"坊主地獄",                 lat:33.311115, lng:131.463916, hint:"泥の坊主頭、何個数えられる？", flag:"🔥", conf:"確定"},
  {name:"海地獄",                   lat:33.316812, lng:131.468738, hint:"コバルトブルーの正体となる成分は？", flag:"🔥", conf:"確定", pt:120, sensor:"ビーコン"},
  {name:"鬼石坊主地獄",              lat:33.315289, lng:131.469613, hint:"足湯の温度は？", flag:"🔥", conf:"確定"},
  {name:"かまど地獄",               lat:33.316388, lng:131.472391, hint:"飲泉は1杯何円？", flag:"🔥", conf:"確定", pt:100, sensor:"GPS+写真AI"},
  {name:"鬼山地獄",                 lat:33.315986, lng:131.473258, hint:"通称は？（ヒント：爬虫類）", flag:"🐊", conf:"確定"},
  {name:"白池地獄",                 lat:33.315271, lng:131.474127, hint:"園内で飼育される熱帯魚を1種あげよ", flag:"🔥", conf:"確定"},
  {name:"血の池地獄",               lat:33.327173, lng:131.478173, hint:"日本最古の天然地獄。赤の正体は？", flag:"🩸", conf:"確定", pt:120, sensor:"GPS+写真AI"},
  {name:"龍巻地獄",                 lat:33.327141, lng:131.479401, hint:"間欠泉の噴出間隔は何分？", flag:"💨", conf:"確定", pt:90,  sensor:"GPS+写真AI"},
  {name:"グランシア別府鉄輪（GOAL）", lat:33.311610, lng:131.461501, hint:"表彰式・地獄蒸しBBQ。勝者に乾杯、敗者に湯治。", flag:"🏁", conf:"確定"}
];

const DEFAULT_SPARE = [
  {name:"鉄輪むし湯",        lat:33.316165, lng:131.477793, memo:"石室8分。体験型ミッション向き"},
  {name:"地獄蒸し工房 鉄輪",  lat:33.315485, lng:131.476220, memo:"昼食枠と兼用可"},
  {name:"湯けむり展望台",     lat:33.315668, lng:131.485326, memo:"24h・駐車8台。撮影ミッション向き"},
  {name:"柴石温泉",          lat:33.325754, lng:131.473019, memo:"血の池・龍巻の近く。水曜休"},
  {name:"別府海浜砂湯",       lat:33.311840, lng:131.501542, memo:"要予約枠。時間管理に注意"},
  {name:"うみたまご／高崎山",  lat:33.258741, lng:131.535563, memo:"大分市域。範囲拡大時の候補"}
];

const BUSHO = [
 // ── 赤軍・朱雀（18） ──
 {a:"r",name:"武田信玄",   kb:"suwa",      kbn:"諏訪法性兜", km:"hishi4",    kmn:"武田菱", img:"portraits/01_r.jpg"},
 {a:"r",name:"山県昌景",   kb:"kuwagata",  kbn:"大鍬形",     km:"hishi4",    kmn:"武田菱", img:"portraits/02_r.jpg"},
 {a:"r",name:"真田幸村",   kb:"shikatsuno",kbn:"鹿角脇立",   km:"rokumon",   kmn:"六文銭", img:"portraits/03_r.jpg"},
 {a:"r",name:"真田昌幸",   kb:"kuwagata",  kbn:"鍬形",       km:"rokumon",   kmn:"六文銭", img:"portraits/04_r.jpg"},
 {a:"r",name:"井伊直政",   kb:"tenzuki",   kbn:"天衝脇立",   km:"igeta",     kmn:"井桁", img:"portraits/05_r.jpg"},
 {a:"r",name:"本多忠勝",   kb:"shikatsuno",kbn:"鹿角脇立",   km:"aoi",       kmn:"立葵", img:"portraits/06_r.jpg"},
 {a:"r",name:"加藤清正",   kb:"eboshi",    kbn:"長烏帽子形", km:"janome",    kmn:"蛇の目", img:"portraits/07_r.jpg"},
 {a:"r",name:"福島正則",   kb:"suigyu",    kbn:"水牛脇立",   km:"omodaka",   kmn:"沢瀉", img:"portraits/08_r.jpg"},
 {a:"r",name:"島津義弘",   kb:"nichirin",  kbn:"日輪前立",   km:"marujuji",  kmn:"丸に十字", img:"portraits/09_r.jpg"},
 {a:"r",name:"島津家久",   kb:"namazuo",   kbn:"鯰尾形",     km:"marujuji",  kmn:"丸に十字", img:"portraits/10_r.jpg"},
 {a:"r",name:"立花宗茂",   kb:"kuwagata",  kbn:"大鍬形",     km:"gion",      kmn:"祇園守", img:"portraits/11_r.jpg"},
 {a:"r",name:"前田利家",   kb:"namazuo",   kbn:"金鯰尾",     km:"umebachi",  kmn:"梅鉢", img:"portraits/12_r.jpg"},
 {a:"r",name:"蒲生氏郷",   kb:"enbi",      kbn:"燕尾形",     km:"tsuru",     kmn:"対い鶴", img:"portraits/13_r.jpg"},
 {a:"r",name:"佐々成政",   kb:"ichinotani",kbn:"一の谷形",   km:"shuro",     kmn:"棕櫚", img:"portraits/14_r.jpg"},
 {a:"r",name:"柴田勝家",   kb:"kuwagata",  kbn:"三鈷前立",   km:"karigane",  kmn:"二つ雁金", img:"portraits/15_r.jpg"},
 {a:"r",name:"織田信長",   kb:"tokan",     kbn:"唐冠形",     km:"mokko",     kmn:"織田木瓜", img:"portraits/16_r.jpg"},
 {a:"r",name:"森長可",     kb:"shikatsuno",kbn:"鹿角",       km:"tsuru",     kmn:"鶴の丸", img:"portraits/17_r.jpg"},
 {a:"r",name:"加藤嘉明",   kb:"mikazuki",  kbn:"三日月前立", km:"fuji",      kmn:"下り藤", img:"portraits/18_r.jpg"},
 // ── 青軍・蒼海（18） ──
 {a:"b",name:"上杉謙信",   kb:"izuna",     kbn:"飯綱権現前立",km:"takesuzume",kmn:"竹に雀", img:"portraits/19_b.jpg"},
 {a:"b",name:"直江兼続",   kb:"ai",        kbn:"「愛」前立", km:"kikko",     kmn:"三つ盛亀甲", img:"portraits/20_b.jpg"},
 {a:"b",name:"徳川家康",   kb:"shida",     kbn:"歯朶前立",   km:"mitsuaoi",  kmn:"三つ葉葵", img:"portraits/21_b.jpg"},
 {a:"b",name:"伊達政宗",   kb:"mikazuki",  kbn:"弦月前立",   km:"takesuzume",kmn:"竹に雀", img:"portraits/22_b.jpg"},
 {a:"b",name:"毛利元就",   kb:"kuwagata",  kbn:"大鍬形",     km:"ichimonji", kmn:"一文字三星", img:"portraits/23_b.jpg"},
 {a:"b",name:"小早川隆景", kb:"nami",      kbn:"波形立物",   km:"ichimonji", kmn:"一文字三星", img:"portraits/24_b.jpg"},
 {a:"b",name:"吉川元春",   kb:"ryuto",     kbn:"龍頭前立",   km:"ichimonji", kmn:"一文字三星", img:"portraits/25_b.jpg"},
 {a:"b",name:"北条氏康",   kb:"shikami",   kbn:"獅噛前立",   km:"uroko",     kmn:"三つ鱗", img:"portraits/26_b.jpg"},
 {a:"b",name:"長宗我部元親",kb:"kuwagata", kbn:"鍬形",       km:"katabami",  kmn:"七つ酢漿草", img:"portraits/27_b.jpg"},
 {a:"b",name:"明智光秀",   kb:"tenzuki",   kbn:"天衝",       km:"kikyo",     kmn:"水色桔梗", img:"portraits/28_b.jpg"},
 {a:"b",name:"石田三成",   kb:"tenzuki",   kbn:"乱髪天衝",   km:"daiichi",   kmn:"大一大万大吉", img:"portraits/29_b.jpg"},
 {a:"b",name:"大谷吉継",   kb:"zukin",     kbn:"頭巾形",     km:"takanoha",  kmn:"違い鷹の羽", img:"portraits/30_b.jpg"},
 {a:"b",name:"黒田官兵衛", kb:"suigyu",    kbn:"水牛脇立",   km:"fujitomoe", kmn:"藤巴", img:"portraits/31_b.jpg"},
 {a:"b",name:"竹中半兵衛", kb:"ichinotani",kbn:"一の谷形",   km:"sasa",      kmn:"九枚笹", img:"portraits/32_b.jpg"},
 {a:"b",name:"藤堂高虎",   kb:"tokan",     kbn:"唐冠形",     km:"tsuta",     kmn:"蔦", img:"portraits/33_b.jpg"},
 {a:"b",name:"最上義光",   kb:"nichirin",  kbn:"日輪前立",   km:"namikamon", kmn:"二頭立波", img:"portraits/34_b.jpg"},
 {a:"b",name:"大友宗麟",   kb:"nanban",    kbn:"南蛮兜",     km:"gyoyo",     kmn:"抱き杏葉", img:"portraits/35_b.jpg"},
 {a:"b",name:"村上武吉",   kb:"nami",      kbn:"波形立物",   km:"kamijoji",  kmn:"丸に上文字", img:"portraits/36_b.jpg"}
];

/* ── 家紋 29種（幾何簡略化の識別用意匠） ── */
const KAMON = {
  hishi4:  '<g fill="currentColor"><path d="M50 8 62 26 50 44 38 26z"/><path d="M50 56 62 74 50 92 38 74z"/><path d="M22 32 34 50 22 68 10 50z"/><path d="M78 32 90 50 78 68 66 50z"/></g>',
  rokumon: '<g fill="none" stroke="currentColor" stroke-width="5"><circle cx="24" cy="34" r="11"/><circle cx="50" cy="34" r="11"/><circle cx="76" cy="34" r="11"/><circle cx="24" cy="68" r="11"/><circle cx="50" cy="68" r="11"/><circle cx="76" cy="68" r="11"/></g>',
  marujuji:'<g fill="none" stroke="currentColor" stroke-width="7"><circle cx="50" cy="50" r="38"/><path d="M50 22v56M22 50h56"/></g>',
  igeta:   '<g fill="none" stroke="currentColor" stroke-width="8"><path d="M32 10v80M68 10v80M10 32h80M10 68h80"/></g>',
  aoi:     '<g fill="currentColor"><path d="M50 6c10 0 18 12 18 24 0 8-6 12-18 12s-18-4-18-12C32 18 40 6 50 6z"/><path d="M14 84c-5-9 0-22 10-28 7-4 13-1 16 6 4 9 0 18-8 22-9 5-15 4-18 0z"/><path d="M86 84c5-9 0-22-10-28-7-4-13-1-16 6-4 9 0 18 8 22 9 5 15 4 18 0z"/></g>',
  mitsuaoi:'<g fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="50" r="44"/></g><g fill="currentColor"><path d="M50 14c8 0 14 9 14 18 0 6-5 9-14 9s-14-3-14-9c0-9 6-18 14-18z"/><path d="M24 82c-4-7 0-17 8-21 5-3 10-1 12 5 3 7 0 14-6 17-7 4-12 3-14-1z"/><path d="M76 82c4-7 0-17-8-21-5-3-10-1-12 5-3 7 0 14 6 17 7 4 12 3 14-1z"/></g>',
  janome:  '<g fill="none" stroke="currentColor" stroke-width="13"><circle cx="50" cy="50" r="38"/></g><circle cx="50" cy="50" r="13" fill="currentColor"/>',
  omodaka: '<g fill="currentColor"><path d="M50 8 68 44H32z"/><path d="M50 40 78 88H22z"/></g>',
  umebachi:'<circle cx="50" cy="50" r="13" fill="currentColor"/><g fill="currentColor"><circle cx="50" cy="18" r="11"/><circle cx="80" cy="40" r="11"/><circle cx="69" cy="78" r="11"/><circle cx="31" cy="78" r="11"/><circle cx="20" cy="40" r="11"/></g>',
  tsuru:   '<g fill="none" stroke="currentColor" stroke-width="5"><circle cx="50" cy="50" r="40"/><path d="M50 74c-14 0-24-10-24-22 0-9 7-16 14-12"/><path d="M50 74c14 0 24-10 24-22 0-9-7-16-14-12"/></g><circle cx="38" cy="38" r="4" fill="currentColor"/><circle cx="62" cy="38" r="4" fill="currentColor"/>',
  shuro:   '<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M50 92V52"/><path d="M50 52 16 30M50 52 30 14M50 52 50 8M50 52 70 14M50 52 84 30M50 52 20 56M50 52 80 56"/></g>',
  karigane:'<g fill="currentColor"><path d="M12 40c10-12 30-14 40-4 4 4 3 10-3 11-10 2-24 0-37-7z"/><path d="M48 74c10-12 30-14 40-4 4 4 3 10-3 11-10 2-24 0-37-7z"/></g><circle cx="20" cy="36" r="3" fill="currentColor"/><circle cx="56" cy="70" r="3" fill="currentColor"/>',
  mokko:   '<g fill="none" stroke="currentColor" stroke-width="6"><ellipse cx="50" cy="50" rx="26" ry="40"/><ellipse cx="50" cy="50" rx="40" ry="26"/></g><circle cx="50" cy="50" r="10" fill="currentColor"/>',
  fuji:    '<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M50 10v18"/><path d="M32 20c-14 8-20 30-14 48M68 20c14 8 20 30 14 48"/></g><g fill="currentColor"><circle cx="20" cy="52" r="6"/><circle cx="26" cy="70" r="6"/><circle cx="34" cy="86" r="6"/><circle cx="80" cy="52" r="6"/><circle cx="74" cy="70" r="6"/><circle cx="66" cy="86" r="6"/></g>',
  gion:    '<g fill="none" stroke="currentColor" stroke-width="6"><rect x="18" y="18" width="64" height="64" rx="6"/><path d="M50 8v84M8 50h84"/></g>',
  takesuzume:'<g fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="50" r="42"/><path d="M22 30c10 14 12 30 8 46M78 30c-10 14-12 30-8 46"/></g><g fill="currentColor"><ellipse cx="50" cy="52" rx="16" ry="12"/><path d="M64 44l12-6-8 12z"/></g>',
  kikko:   '<g fill="none" stroke="currentColor" stroke-width="5"><path d="M50 6 78 22v36L50 74 22 58V22z"/><path d="M50 30 62 37v14l-12 7-12-7V37z"/></g><path d="M50 78l14 8-14 8-14-8z" fill="currentColor"/>',
  ichimonji:'<rect x="12" y="20" width="76" height="10" fill="currentColor"/><g fill="currentColor"><circle cx="50" cy="52" r="12"/><circle cx="24" cy="76" r="12"/><circle cx="76" cy="76" r="12"/></g>',
  uroko:   '<g fill="currentColor"><path d="M50 10 72 48H28z"/><path d="M26 52 46 88H6z"/><path d="M74 52 94 88H54z"/></g>',
  katabami:'<g fill="currentColor"><path d="M50 46c-6-16-2-32 0-38 2 6 6 22 0 38z"/><path d="M50 46c16-6 32-2 38 0-6 2-22 6-38 0z"/><path d="M50 54c6 16 2 32 0 38-2-6-6-22 0-38z"/><path d="M50 54c-16 6-32 2-38 0 6-2 22-6 38 0z"/></g><g fill="none" stroke="currentColor" stroke-width="4"><path d="M50 50 22 22M50 50l28-28M50 50 22 78M50 50l28 28"/></g>',
  kikyo:   '<path d="M50 6 62 38l34 2-27 22 10 32-29-19-29 19 10-32-27-22 34-2z" fill="currentColor"/>',
  daiichi: '<g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="square"><path d="M14 26h72M14 50h72M14 74h72"/><path d="M50 14v72"/></g>',
  takanoha:'<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"><path d="M26 88C18 60 26 26 40 10"/><path d="M74 88C82 60 74 26 60 10"/><path d="M32 44l16 8M68 44l-16 8M30 62l18 8M70 62l-18 8"/></g>',
  fujitomoe:'<g fill="none" stroke="currentColor" stroke-width="6"><circle cx="50" cy="50" r="40"/><path d="M50 18c18 0 30 14 30 30 0 12-10 20-20 16-8-3-8-14 0-18"/></g>',
  sasa:    '<g fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="50" r="42"/></g><g fill="currentColor"><path d="M50 18c8 10 8 24 0 34-8-10-8-24 0-34z"/><path d="M24 34c12 4 20 16 20 28-12-4-20-16-20-28z"/><path d="M76 34c-12 4-20 16-20 28 12-4 20-16 20-28z"/><path d="M50 56c6 10 6 20 0 28-6-8-6-18 0-28z"/></g>',
  tsuta:   '<path d="M50 8c4 14 14 20 26 22-6 10-4 22 4 32-14 2-22 10-26 26-4-16-12-24-26-26 8-10 10-22 4-32 12-2 22-8 26-22z" fill="currentColor"/><path d="M50 88v10" stroke="currentColor" stroke-width="4"/>',
  namikamon:'<g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"><path d="M10 40q20-24 40 0t40 0"/><path d="M10 70q20-24 40 0t40 0"/></g>',
  gyoyo:   '<g fill="currentColor"><path d="M46 88C26 76 18 54 26 30c8 4 16 14 20 26z"/><path d="M54 88c20-12 28-34 20-58-8 4-16 14-20 26z"/></g><circle cx="50" cy="16" r="8" fill="currentColor"/>',
  kamijoji:'<g fill="none" stroke="currentColor" stroke-width="6"><circle cx="50" cy="50" r="40"/></g><g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="square"><path d="M50 24v34M32 44h36M28 70h44"/></g>'
};

/* ── 兜：鉢（共通）＋ 前立 20種 ── */
const BOWL =
  '<path d="M50 30c-20 0-33 14-35 32-1 8 1 12 5 12h60c4 0 6-4 5-12-2-18-15-32-35-32z" fill="currentColor" opacity=".9"/>'
+ '<path d="M13 74c-2 10 4 16 14 16h46c10 0 16-6 14-16z" fill="currentColor" opacity=".5"/>'
+ '<path d="M50 56c-5 0-8 4-8 9v9h16v-9c0-5-3-9-8-9z" fill="#16151a" opacity=".85"/>';

const MAEDATE = {
  kuwagata:'<g fill="currentColor"><path d="M40 34C34 24 26 14 16 8c2 12 8 22 16 30z"/><path d="M60 34C66 24 74 14 84 8c-2 12-8 22-16 30z"/></g>',
  shikatsuno:'<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M38 32C28 22 22 12 20 4M28 20l-12-4M32 26l-14 4"/><path d="M62 32C72 22 78 12 80 4M72 20l12-4M68 26l14 4"/></g>',
  suwa:'<path d="M50 4c-14 0-26 8-30 20 8-4 20-6 30-6s22 2 30 6C76 12 64 4 50 4z" fill="currentColor" opacity=".85"/><g fill="none" stroke="currentColor" stroke-width="3"><path d="M22 26q8-8 12 4M78 26q-8-8-12 4"/></g>',
  tenzuki:'<path d="M50 2c-8 12-10 24-6 32h12c4-8 2-20-6-32z" fill="currentColor"/><path d="M40 34c-8-6-16-6-22-2 6 4 14 6 22 2zM60 34c8-6 16-6 22-2-6 4-14 6-22 2z" fill="currentColor" opacity=".7"/>',
  eboshi:'<path d="M50 30C46 20 44 8 52 0c6 8 8 18 6 30z" fill="currentColor"/><path d="M44 32h16v4H44z" fill="currentColor" opacity=".6"/>',
  suigyu:'<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"><path d="M40 34C26 30 14 20 12 6c12 4 22 14 28 24z"/><path d="M60 34c14-4 26-14 28-28-12 4-22 14-28 24z"/></g>',
  nichirin:'<circle cx="50" cy="18" r="13" fill="currentColor"/><g stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M30 18h-8M70 18h8M36 4l-5-5M64 4l5-5"/></g>',
  namazuo:'<path d="M50 32c-6-14-4-26 8-32-2 12 2 22 6 30z" fill="currentColor"/><path d="M64 6c6-2 10 0 12 4-5 1-9 0-12-4z" fill="currentColor" opacity=".7"/>',
  enbi:'<g fill="currentColor"><path d="M48 32 30 2c-2 14 4 24 14 32z"/><path d="M52 32 70 2c2 14-4 24-14 32z"/></g>',
  ichinotani:'<path d="M18 32V10h64v22z" fill="none" stroke="currentColor" stroke-width="5"/><path d="M50 10V2" stroke="currentColor" stroke-width="5"/>',
  tokan:'<g fill="currentColor"><path d="M50 32c-4-10-4-20 0-28 4 8 4 18 0 28z"/><path d="M30 34C18 28 10 18 8 6c12 4 20 14 26 26z" opacity=".8"/><path d="M70 34c12-6 20-16 22-28-12 4-20 14-26 26z" opacity=".8"/></g>',
  izuna:'<g fill="currentColor"><path d="M50 2c-6 8-8 16-6 22 2 6 4 8 6 10 2-2 4-4 6-10 2-6 0-14-6-22z"/><path d="M36 26c-2-6-6-10-12-12 2 8 6 14 12 16zM64 26c2-6 6-10 12-12-2 8-6 14-12 16z" opacity=".7"/></g>',
  ai:'<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M50 2v8M36 12h28M32 20h36M40 28h20M44 34h12"/></g>',
  shida:'<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M40 34C34 22 30 10 32 0M60 34c6-12 10-24 8-34"/><path d="M34 12l-8-4M36 22l-10-2M66 12l8-4M64 22l10-2"/></g>',
  mikazuki:'<path d="M22 30C14 22 14 8 24 0c-4 12 0 22 10 28-4 4-8 4-12 2z" fill="currentColor"/><path d="M78 30c8-8 8-22-2-30 4 12 0 22-10 28 4 4 8 4 12 2z" fill="currentColor" opacity=".35"/>',
  nami:'<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M18 30q10-16 20 0t20 0 20 0"/><path d="M26 16q8-12 16 0t16 0"/></g>',
  ryuto:'<path d="M50 34c-10-4-16-14-14-24 6 4 10 2 14-4 4 6 8 8 14 4 2 10-4 20-14 24z" fill="currentColor"/><circle cx="44" cy="16" r="2.5" fill="#16151a"/><circle cx="56" cy="16" r="2.5" fill="#16151a"/>',
  shikami:'<path d="M32 34c-4-10-2-22 6-28 4 6 8 6 12 0 4 6 8 6 12 0 8 6 10 18 6 28z" fill="currentColor"/><g fill="#16151a"><circle cx="42" cy="18" r="3"/><circle cx="58" cy="18" r="3"/><path d="M42 28h16v4H42z"/></g>',
  zukin:'<path d="M28 34c-2-14 8-26 22-26s24 12 22 26z" fill="currentColor" opacity=".8"/><path d="M28 30h44v4H28z" fill="currentColor"/>',
  nanban:'<path d="M50 4c-14 0-24 12-24 26v4h48v-4c0-14-10-26-24-26z" fill="currentColor" opacity=".85"/><path d="M50 4v30" stroke="#16151a" stroke-width="3"/><path d="M22 34h56v5H22z" fill="currentColor"/>'
};

function svgKabuto(b){
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'
    + b.name + 'の兜（' + b.kbn + '）">' + (MAEDATE[b.kb]||'') + BOWL + '</svg>';
}
function svgKamon(km){
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + (KAMON[km]||'') + '</svg>';
}
/* 25パネルの意匠：36将から巡回割当 */
const PANEL_KAMON = Array.from({length:25},(_,i)=>BUSHO[i % BUSHO.length].km);

/* ユーティリティ */
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function haversine(a,b,c,d){
  const R=6371000, t=x=>x*Math.PI/180;
  const dLat=t(c-a), dLng=t(d-b);
  const h=Math.sin(dLat/2)**2 + Math.cos(t(a))*Math.cos(t(c))*Math.sin(dLng/2)**2;
  return Math.round(2*R*Math.asin(Math.sqrt(h)));
}
const gmapLink = cp => 'https://www.google.com/maps/search/?api=1&query='+cp.lat+','+cp.lng;
const gnavLink = cp => 'https://www.google.com/maps/dir/?api=1&destination='+cp.lat+','+cp.lng+'&travelmode=driving';
