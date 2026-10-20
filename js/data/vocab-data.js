/* =========================================================
   靜態資料庫 1：三人專屬生字表與內置中英字典
   ========================================================= */
const COLOR_HEX = ['#38bdf8', '#22c55e', '#facc15', '#e879f9', '#fb923c'];

const INITIAL_PROFILE_WORDS = {
  MARCUS: `[Unit 1]
aim, 目標 (n./v.)
observe, 觀察 (v.)
conservation, 保育 (n.)
progress, 進步 (n.)
relieved, 放心的 (adj.)
endangered, 瀕危的 (adj.)
predator, 捕食者 (n.)
attitude, 態度 (n.)
succeed, 成功 (v.)
resist, 抵抗 (v.)
extinct, 絕種的 (adj.)
presenter, 主持人 (n.)
develop, 發展 (v.)
interrupted, 被打斷 (v.)
connection, 聯繫 (n.)
habitat, 棲息地 (n.)
species, 物種 (n.)
open-minded, 思想開明的 (adj.)
protect, 保護
steady, 穩定的 (adj.)
prey, 獵物 (n.)
navigate, 導航 (v.)
fail, 失敗 (v.)
barely, 勉強/幾乎不 (adv.)
reality, 現實 (n.)`,

  JUSTIN: `[Unit 1]
arrive at school early, 提早返到學校
arrive at school late, 遲到返學校
dress tidily, 穿著整齊
dress untidily, 穿著不整齊
wait patiently, 耐心地等待
wait impatiently, 不耐煩地等待
eat quietly, 安靜地進食
eat noisily, 嘈吵地進食
speak politely, 有禮貌地說話
speak rudely, 粗魯地說話
jump the queue, 打尖 / 插隊
offer your seat, 讓座
push other passengers, 推撞其他乘客
rush to the seats, 衝去搶座位
talk on the phone softly, 細聲講電話
talk on the phone loudly, 大聲講電話

[Unit 2]
be mean to, 對...刻薄/惡劣
be nice to, 對...友善
say sorry to, 向...道歉
share with, 與...分享
quarrel with, 與...吵架/爭論
discuss with, 與...討論
agree with, 同意...
disagree with, 不同意...
get on with, 與...融洽相處
help with, 幫...做(功課)
lie to, 對...講大話
be jealous of, 妒忌...
take care of, 照顧...
shocked, 震驚的 (adj.)
puzzled, 困惑的 (adj.)
embarrassed, 尷尬的 (adj.)
annoyed, 惱怒/煩躁的 (adj.)
upset, 難過/心煩的 (adj.)
disappointed, 失望的 (adj.)

[Unit 3]
a vest, 一件背心
a suit, 一套西裝
sandals, 涼鞋
gloves, 手套 (五指分開)
mittens, 連指手套
glasses, 眼鏡
sunglasses, 太陽眼鏡
curly blonde hair, 捲曲的金髮
long straight hair, 長直髮
a round face, 圓臉
a long face, 長臉`,

  FUNG: `[Unit 1]
go rock climbing, 去攀石
go jogging, 去慢跑
go cycling, 去踩單車
go ice-skating, 去溜冰
go to an indoor playground, 去室內遊樂場
go to a public library, 去公共圖書館
play tennis, 打網球
play volleyball, 打排球
play online games, 玩網上遊戲
play video games, 玩電子遊戲
text my friend, 傳訊息給朋友
read the newspaper, 睇報紙
read magazines, 睇雜誌`
};

const BUILTIN_DICT = {
  apple: '蘋果 (n.)', water: '水 (n.)', environment: '環境', pollution: '污染',
  aim: '目標 (n./v.)', observe: '觀察 (v.)', conservation: '保育 (n.)',
  progress: '進步 (n.)', relieved: '放心的 (adj.)', endangered: '瀕危的 (adj.)',
  predator: '捕食者 (n.)', attitude: '態度 (n.)', succeed: '成功 (v.)', resist: '抵抗 (v.)',
  extinct: '絕種的 (adj.)', presenter: '主持人 (n.)', develop: '發展 (v.)',
  interrupted: '被打斷 (v.)', connection: '聯繫 (n.)', habitat: '棲息地 (n.)',
  species: '物種 (n.)', 'open-minded': '思想開明的 (adj.)', protect: '保護',
  steady: '穩定的 (adj.)', prey: '獵物 (n.)', navigate: '導航 (v.)', fail: '失敗 (v.)',
  barely: '勉強/幾乎不 (adv.)', reality: '現實 (n.)',
  shocked: '震驚的 (adj.)', puzzled: '困惑的 (adj.)', embarrassed: '尷尬的 (adj.)',
  annoyed: '煩躁的 (adj.)', upset: '難過的 (adj.)', disappointed: '失望的 (adj.)'
};
