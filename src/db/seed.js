/**
 * 内置菜品数据
 * 字段：name 名称 / category 分类 / emoji 贴图 / kcalPer100g 每100克热量(千卡) /
 *      defaultPortionG 食堂常见一份的重量(克)
 * 热量口径参考《中国食品成分表》第 6 版及中国疾控中心营养所食物营养成分查询平台，
 * 部分复合菜品（如宫保鸡丁、奶茶）为常见做法估算值，用户可在应用内自行修正。
 * 数据仅用于生活记录，不构成营养或医疗建议。
 */
export const seedDishes = [
  // ---------- 主食 ----------
  { name: '米饭', category: '主食', emoji: '🍚', kcalPer100g: 116, defaultPortionG: 200 },
  { name: '馒头', category: '主食', emoji: '🫓', kcalPer100g: 223, defaultPortionG: 100 },
  { name: '花卷', category: '主食', emoji: '🫓', kcalPer100g: 217, defaultPortionG: 90 },
  { name: '白粥', category: '主食', emoji: '🥣', kcalPer100g: 46, defaultPortionG: 300 },
  { name: '煮面条', category: '主食', emoji: '🍜', kcalPer100g: 107, defaultPortionG: 250 },
  { name: '方便面', category: '主食', emoji: '🍜', kcalPer100g: 470, defaultPortionG: 100 },
  { name: '包子', category: '主食', emoji: '🥟', kcalPer100g: 230, defaultPortionG: 100 },
  { name: '饺子', category: '主食', emoji: '🥟', kcalPer100g: 250, defaultPortionG: 200 },
  { name: '蛋炒饭', category: '主食', emoji: '🍚', kcalPer100g: 174, defaultPortionG: 300 },
  { name: '凉皮', category: '主食', emoji: '🍜', kcalPer100g: 130, defaultPortionG: 300 },
  { name: '肉夹馍', category: '主食', emoji: '🥙', kcalPer100g: 228, defaultPortionG: 150 },
  { name: '煎饼果子', category: '主食', emoji: '🥞', kcalPer100g: 336, defaultPortionG: 150 },
  { name: '牛肉面', category: '主食', emoji: '🍜', kcalPer100g: 119, defaultPortionG: 300 },
  { name: '黄焖鸡米饭', category: '主食', emoji: '🍲', kcalPer100g: 150, defaultPortionG: 350 },

  // ---------- 荤菜 ----------
  { name: '番茄炒蛋', category: '荤菜', emoji: '🍅', kcalPer100g: 86, defaultPortionG: 150 },
  { name: '宫保鸡丁', category: '荤菜', emoji: '🍗', kcalPer100g: 180, defaultPortionG: 150 },
  { name: '红烧肉', category: '荤菜', emoji: '🥩', kcalPer100g: 350, defaultPortionG: 120 },
  { name: '鱼香肉丝', category: '荤菜', emoji: '🥘', kcalPer100g: 150, defaultPortionG: 150 },
  { name: '土豆烧鸡', category: '荤菜', emoji: '🍗', kcalPer100g: 140, defaultPortionG: 160 },
  { name: '糖醋里脊', category: '荤菜', emoji: '🍖', kcalPer100g: 260, defaultPortionG: 150 },
  { name: '水煮肉片', category: '荤菜', emoji: '🌶️', kcalPer100g: 150, defaultPortionG: 160 },
  { name: '回锅肉', category: '荤菜', emoji: '🥓', kcalPer100g: 280, defaultPortionG: 140 },
  { name: '可乐鸡翅', category: '荤菜', emoji: '🍗', kcalPer100g: 180, defaultPortionG: 150 },
  { name: '清蒸鱼', category: '荤菜', emoji: '🐟', kcalPer100g: 110, defaultPortionG: 150 },
  { name: '炸鸡腿', category: '荤菜', emoji: '🍗', kcalPer100g: 260, defaultPortionG: 120 },
  { name: '黑椒牛柳', category: '荤菜', emoji: '🥩', kcalPer100g: 150, defaultPortionG: 150 },
  { name: '青椒肉丝', category: '荤菜', emoji: '🫑', kcalPer100g: 130, defaultPortionG: 150 },
  { name: '西红柿炖牛腩', category: '荤菜', emoji: '🍲', kcalPer100g: 120, defaultPortionG: 180 },

  // ---------- 素菜 ----------
  { name: '麻婆豆腐', category: '素菜', emoji: '🥘', kcalPer100g: 120, defaultPortionG: 150 },
  { name: '酸辣土豆丝', category: '素菜', emoji: '🥔', kcalPer100g: 100, defaultPortionG: 150 },
  { name: '干煸豆角', category: '素菜', emoji: '🫘', kcalPer100g: 130, defaultPortionG: 150 },
  { name: '清炒时蔬', category: '素菜', emoji: '🥬', kcalPer100g: 60, defaultPortionG: 150 },
  { name: '蒜蓉西兰花', category: '素菜', emoji: '🥦', kcalPer100g: 55, defaultPortionG: 150 },
  { name: '凉拌黄瓜', category: '素菜', emoji: '🥒', kcalPer100g: 25, defaultPortionG: 150 },
  { name: '地三鲜', category: '素菜', emoji: '🍆', kcalPer100g: 120, defaultPortionG: 160 },
  { name: '红烧茄子', category: '素菜', emoji: '🍆', kcalPer100g: 90, defaultPortionG: 150 },
  { name: '番茄鸡蛋汤', category: '素菜', emoji: '🍲', kcalPer100g: 30, defaultPortionG: 250 },
  { name: '紫菜蛋花汤', category: '素菜', emoji: '🍲', kcalPer100g: 35, defaultPortionG: 250 },
  { name: '凉拌海带丝', category: '素菜', emoji: '🌿', kcalPer100g: 40, defaultPortionG: 100 },

  // ---------- 小吃 / 饮品 ----------
  { name: '水煮蛋', category: '小吃饮品', emoji: '🥚', kcalPer100g: 144, defaultPortionG: 50 },
  { name: '豆浆', category: '小吃饮品', emoji: '🥛', kcalPer100g: 31, defaultPortionG: 300 },
  { name: '牛奶', category: '小吃饮品', emoji: '🥛', kcalPer100g: 54, defaultPortionG: 250 },
  { name: '酸奶', category: '小吃饮品', emoji: '🥛', kcalPer100g: 72, defaultPortionG: 150 },
  { name: '奶茶', category: '小吃饮品', emoji: '🧋', kcalPer100g: 85, defaultPortionG: 500 },
  { name: '可乐', category: '小吃饮品', emoji: '🥤', kcalPer100g: 43, defaultPortionG: 500 },
  { name: '香蕉', category: '小吃饮品', emoji: '🍌', kcalPer100g: 93, defaultPortionG: 120 },
  { name: '苹果', category: '小吃饮品', emoji: '🍎', kcalPer100g: 53, defaultPortionG: 200 },
  { name: '薯片', category: '小吃饮品', emoji: '🍟', kcalPer100g: 540, defaultPortionG: 50 },
  { name: '汉堡', category: '小吃饮品', emoji: '🍔', kcalPer100g: 260, defaultPortionG: 200 },
  { name: '炸鸡块', category: '小吃饮品', emoji: '🍗', kcalPer100g: 270, defaultPortionG: 100 },
  { name: '烤肠', category: '小吃饮品', emoji: '🌭', kcalPer100g: 280, defaultPortionG: 60 },
  { name: '蛋糕', category: '小吃饮品', emoji: '🍰', kcalPer100g: 320, defaultPortionG: 100 },
  { name: '冰淇淋', category: '小吃饮品', emoji: '🍦', kcalPer100g: 207, defaultPortionG: 80 }
]

export const categories = ['主食', '荤菜', '素菜', '小吃饮品']
