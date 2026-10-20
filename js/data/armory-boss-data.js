/* =========================================================
   靜態資料庫 4：16 款武器裝甲與 8 款 Boss 設定
   ========================================================= */
const WEAPONS = [
  { id: 'cyber', name: '💻 藍翼全息炮', desc: '標準藍光數據彈', color: '#38bdf8', dmg: 14, costKey: 0, unlocked: true },
  { id: 'dual', name: '🔫 雙持雷射槍', desc: '雙發平行雷射彈', color: '#4ade80', dmg: 10, dual: true, costKey: 1, unlocked: false },
  { id: 'kunai', name: '🗡️ 霓虹苦無', desc: '高速暴擊飛刀', color: '#a855f7', dmg: 18, costKey: 2, unlocked: false },
  { id: 'shatter', name: '❄️ 冰晶散彈槍', desc: '三連發扇形冰彈', color: '#67e8f9', dmg: 11, spread: true, costKey: 3, unlocked: false },
  { id: 'flame', name: '🔥 烈焰噴射器', desc: '高射速灼熱火球', color: '#fb923c', dmg: 15, rapid: true, costKey: 5, unlocked: false },
  { id: 'railgun', name: '⚡ 電磁狙擊炮', desc: '超高速貫穿雷霆彈', color: '#38bdf8', dmg: 22, fastBullet: true, costKey: 7, unlocked: false },
  { id: 'rpg', name: '🚀 黃金火箭炮', desc: '巨型高傷爆炸彈頭', color: '#facc15', dmg: 26, big: true, costKey: 10, unlocked: false },
  { id: 'void', name: '🌌 虛空黑洞炮', desc: '終極神武：三連黑洞彈', color: '#e879f9', dmg: 19, spread: true, big: true, costKey: 14, unlocked: false }
];

const ARMORS = [
  { id: 'shield', name: '💧 水流能量護盾', desc: '開局 +45 藍盾甲', costKey: 0, unlocked: true },
  { id: 'coinchip', name: '💰 雙倍金幣晶片', desc: '賺取提示金幣 ×2', costKey: 1, unlocked: false },
  { id: 'boots', name: '⚡ 量子閃避靴', desc: '移動速度 +30%', costKey: 2, unlocked: false },
  { id: 'magnet', name: '🧲 磁力吸心環', desc: '遠距離自動吸紅心', costKey: 3, unlocked: false },
  { id: 'thorn', name: '🌵 荊棘反傷裝甲', desc: '受擊時反彈 8 點傷害', costKey: 4, unlocked: false },
  { id: 'vamp', name: '🧛 奈米吸血核心', desc: '命中敵人回復 +4 HP', costKey: 6, unlocked: false },
  { id: 'drone', name: '🛸 雷電無人機', desc: '每 3 秒自動電擊敵人', costKey: 8, unlocked: false },
  { id: 'phoenix', name: '🔥 不死鳳凰核心', desc: '每局可滿血復活一次', costKey: 12, unlocked: false }
];

const BOSS_PROFILES = [
  { name: 'CRIMSON MECHA', title: '紅蓮機械魔王', style: 'mecha', bodyColor: '#991b1b', wingColor: '#ef4444', visor: '#facc15' },
  { name: 'SKULL REAPER', title: '冥界骷髏死神', style: 'skull', bodyColor: '#1e293b', wingColor: '#94a3b8', visor: '#f43f5e' },
  { name: 'SHADOW NINJA', title: '暗影忍び宗師', style: 'ninja', bodyColor: '#1e1b4b', wingColor: '#a855f7', visor: '#22c55e' },
  { name: 'KRAKEN LORD', title: '深海觸手巨怪', style: 'kraken', bodyColor: '#0f766e', wingColor: '#2dd4bf', visor: '#fde047' },
  { name: 'INFERNO DRAGON', title: '熔岩烈焰魔龍', style: 'dragon', bodyColor: '#7c2d12', wingColor: '#f97316', visor: '#fef08a' },
  { name: 'FROST QUEEN', title: '極地冰晶女皇', style: 'frost', bodyColor: '#0369a1', wingColor: '#7dd3fc', visor: '#ffffff' },
  { name: 'CYBER PHARAOH', title: '黃金機械法老', style: 'pharaoh', bodyColor: '#713f12', wingColor: '#facc15', visor: '#38bdf8' },
  { name: 'VOID HACKER', title: '虛空病毒駭客', style: 'hacker', bodyColor: '#064e3b', wingColor: '#10b981', visor: '#e879f9' }
];
