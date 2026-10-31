/**
 * 常见食物热量参考库（每 100 克，单位：千卡 kcal）
 *
 * 用途：在「添加 / 编辑菜品」时可直接搜索点选，自动填充每百克热量，
 * 免去手动联网查询。
 *
 * 数据口径：参考《中国食品成分表》第 6 版及中国疾控中心营养所食物营养
 * 成分查询平台的常见数值；标注「熟 / 生 / 干 / 鲜」是因为含水量会显著
 * 影响每百克热量。不同品牌、做法会有差异，复合加工食品请以包装营养
 * 成分表为准。数据仅用于生活记录，不构成营养或医疗建议。
 *
 * 字段：name 名称 / emoji 贴图 / category 分类 / kcal 每百克热量
 */
export const foodCalorieRef = [
  // ================= 谷薯主食 =================
  { name: '米饭（熟）', emoji: '🍚', category: '谷薯主食', kcal: 116 },
  { name: '白粥（熟）', emoji: '🥣', category: '谷薯主食', kcal: 46 },
  { name: '糙米（熟）', emoji: '🍚', category: '谷薯主食', kcal: 111 },
  { name: '小米粥（熟）', emoji: '🥣', category: '谷薯主食', kcal: 46 },
  { name: '馒头（蒸）', emoji: '🫓', category: '谷薯主食', kcal: 223 },
  { name: '花卷（蒸）', emoji: '🫓', category: '谷薯主食', kcal: 217 },
  { name: '面条（煮）', emoji: '🍜', category: '谷薯主食', kcal: 109 },
  { name: '挂面（干）', emoji: '🍜', category: '谷薯主食', kcal: 346 },
  { name: '方便面（干）', emoji: '🍜', category: '谷薯主食', kcal: 472 },
  { name: '米粉（干）', emoji: '🍜', category: '谷薯主食', kcal: 346 },
  { name: '面包（平均）', emoji: '🍞', category: '谷薯主食', kcal: 313 },
  { name: '全麦面包', emoji: '🍞', category: '谷薯主食', kcal: 250 },
  { name: '吐司', emoji: '🍞', category: '谷薯主食', kcal: 280 },
  { name: '燕麦片（干）', emoji: '🥣', category: '谷薯主食', kcal: 377 },
  { name: '玉米（鲜）', emoji: '🌽', category: '谷薯主食', kcal: 112 },
  { name: '红薯（生）', emoji: '🍠', category: '谷薯主食', kcal: 99 },
  { name: '土豆（生）', emoji: '🥔', category: '谷薯主食', kcal: 81 },
  { name: '土豆（煮）', emoji: '🥔', category: '谷薯主食', kcal: 77 },
  { name: '山药（生）', emoji: '🍠', category: '谷薯主食', kcal: 57 },
  { name: '油条', emoji: '🥖', category: '谷薯主食', kcal: 388 },
  { name: '包子（蒸）', emoji: '🥟', category: '谷薯主食', kcal: 223 },
  { name: '饺子（煮）', emoji: '🥟', category: '谷薯主食', kcal: 250 },

  // ================= 豆类 / 豆制品 =================
  { name: '黄豆（干）', emoji: '🫘', category: '豆制品', kcal: 390 },
  { name: '绿豆（干）', emoji: '🫘', category: '豆制品', kcal: 329 },
  { name: '红豆（干）', emoji: '🫘', category: '豆制品', kcal: 324 },
  { name: '鹰嘴豆（熟）', emoji: '🫘', category: '豆制品', kcal: 164 },
  { name: '毛豆（鲜）', emoji: '🫛', category: '豆制品', kcal: 131 },
  { name: '豌豆（鲜）', emoji: '🫛', category: '豆制品', kcal: 111 },
  { name: '北豆腐', emoji: '🧈', category: '豆制品', kcal: 116 },
  { name: '嫩豆腐', emoji: '🧈', category: '豆制品', kcal: 57 },
  { name: '豆浆（无糖）', emoji: '🥛', category: '豆制品', kcal: 31 },
  { name: '豆腐干', emoji: '🧈', category: '豆制品', kcal: 140 },
  { name: '腐竹（干）', emoji: '🧈', category: '豆制品', kcal: 459 },

  // ================= 肉类 =================
  { name: '猪肉（瘦）', emoji: '🥩', category: '肉类', kcal: 143 },
  { name: '五花肉', emoji: '🥓', category: '肉类', kcal: 395 },
  { name: '排骨', emoji: '🍖', category: '肉类', kcal: 264 },
  { name: '火腿肠', emoji: '🌭', category: '肉类', kcal: 212 },
  { name: '午餐肉', emoji: '🥫', category: '肉类', kcal: 220 },
  { name: '香肠', emoji: '🌭', category: '肉类', kcal: 508 },
  { name: '培根', emoji: '🥓', category: '肉类', kcal: 320 },
  { name: '牛肉（瘦）', emoji: '🥩', category: '肉类', kcal: 106 },
  { name: '牛腩', emoji: '🥩', category: '肉类', kcal: 283 },
  { name: '牛腱', emoji: '🥩', category: '肉类', kcal: 98 },
  { name: '羊肉（瘦）', emoji: '🥩', category: '肉类', kcal: 118 },
  { name: '鸡胸肉（生）', emoji: '🍗', category: '肉类', kcal: 118 },
  { name: '鸡胸肉（熟）', emoji: '🍗', category: '肉类', kcal: 165 },
  { name: '鸡腿肉（去皮）', emoji: '🍗', category: '肉类', kcal: 181 },
  { name: '鸡翅', emoji: '🍗', category: '肉类', kcal: 194 },
  { name: '鸭肉', emoji: '🦆', category: '肉类', kcal: 240 },

  // ================= 水产 =================
  { name: '草鱼', emoji: '🐟', category: '水产', kcal: 113 },
  { name: '鲫鱼', emoji: '🐟', category: '水产', kcal: 108 },
  { name: '带鱼', emoji: '🐟', category: '水产', kcal: 127 },
  { name: '鲈鱼', emoji: '🐟', category: '水产', kcal: 105 },
  { name: '鳕鱼', emoji: '🐟', category: '水产', kcal: 88 },
  { name: '三文鱼', emoji: '🍣', category: '水产', kcal: 139 },
  { name: '金枪鱼', emoji: '🍣', category: '水产', kcal: 108 },
  { name: '对虾', emoji: '🦐', category: '水产', kcal: 93 },
  { name: '基围虾', emoji: '🦐', category: '水产', kcal: 101 },
  { name: '螃蟹', emoji: '🦀', category: '水产', kcal: 95 },
  { name: '鱿鱼', emoji: '🦑', category: '水产', kcal: 92 },
  { name: '墨鱼', emoji: '🦑', category: '水产', kcal: 83 },

  // ================= 蛋类 / 奶制品 =================
  { name: '鸡蛋（全）', emoji: '🥚', category: '蛋奶', kcal: 144 },
  { name: '鸡蛋白', emoji: '🥚', category: '蛋奶', kcal: 60 },
  { name: '鸡蛋黄', emoji: '🥚', category: '蛋奶', kcal: 328 },
  { name: '鸭蛋', emoji: '🥚', category: '蛋奶', kcal: 180 },
  { name: '鹌鹑蛋', emoji: '🥚', category: '蛋奶', kcal: 160 },
  { name: '牛奶（全脂）', emoji: '🥛', category: '蛋奶', kcal: 65 },
  { name: '牛奶（脱脂）', emoji: '🥛', category: '蛋奶', kcal: 33 },
  { name: '酸奶（原味）', emoji: '🥛', category: '蛋奶', kcal: 72 },
  { name: '无糖酸奶', emoji: '🥛', category: '蛋奶', kcal: 60 },
  { name: '奶酪', emoji: '🧀', category: '蛋奶', kcal: 328 },
  { name: '奶粉（全脂）', emoji: '🥛', category: '蛋奶', kcal: 478 },

  // ================= 蔬菜 =================
  { name: '白菜', emoji: '🥬', category: '蔬菜', kcal: 17 },
  { name: '菠菜', emoji: '🥬', category: '蔬菜', kcal: 28 },
  { name: '生菜', emoji: '🥬', category: '蔬菜', kcal: 15 },
  { name: '西兰花', emoji: '🥦', category: '蔬菜', kcal: 36 },
  { name: '菜花', emoji: '🥦', category: '蔬菜', kcal: 26 },
  { name: '黄瓜', emoji: '🥒', category: '蔬菜', kcal: 16 },
  { name: '番茄', emoji: '🍅', category: '蔬菜', kcal: 20 },
  { name: '茄子', emoji: '🍆', category: '蔬菜', kcal: 23 },
  { name: '青椒', emoji: '🫑', category: '蔬菜', kcal: 22 },
  { name: '冬瓜', emoji: '🍈', category: '蔬菜', kcal: 12 },
  { name: '苦瓜', emoji: '🥒', category: '蔬菜', kcal: 22 },
  { name: '胡萝卜', emoji: '🥕', category: '蔬菜', kcal: 39 },
  { name: '白萝卜', emoji: '🥕', category: '蔬菜', kcal: 23 },
  { name: '南瓜', emoji: '🎃', category: '蔬菜', kcal: 23 },
  { name: '蘑菇', emoji: '🍄', category: '蔬菜', kcal: 24 },
  { name: '香菇（鲜）', emoji: '🍄', category: '蔬菜', kcal: 26 },
  { name: '木耳（水发）', emoji: '🍄', category: '蔬菜', kcal: 27 },
  { name: '海带（鲜）', emoji: '🌿', category: '蔬菜', kcal: 17 },
  { name: '洋葱', emoji: '🧅', category: '蔬菜', kcal: 40 },
  { name: '芦笋', emoji: '🌱', category: '蔬菜', kcal: 22 },
  { name: '芹菜', emoji: '🥬', category: '蔬菜', kcal: 17 },
  { name: '豆芽', emoji: '🌱', category: '蔬菜', kcal: 30 },
  { name: '大蒜', emoji: '🧄', category: '蔬菜', kcal: 128 },

  // ================= 水果 =================
  { name: '苹果', emoji: '🍎', category: '水果', kcal: 53 },
  { name: '香蕉', emoji: '🍌', category: '水果', kcal: 93 },
  { name: '橙子', emoji: '🍊', category: '水果', kcal: 48 },
  { name: '橘子', emoji: '🍊', category: '水果', kcal: 51 },
  { name: '梨', emoji: '🍐', category: '水果', kcal: 51 },
  { name: '西瓜', emoji: '🍉', category: '水果', kcal: 31 },
  { name: '葡萄', emoji: '🍇', category: '水果', kcal: 45 },
  { name: '草莓', emoji: '🍓', category: '水果', kcal: 32 },
  { name: '蓝莓', emoji: '🫐', category: '水果', kcal: 57 },
  { name: '猕猴桃', emoji: '🥝', category: '水果', kcal: 61 },
  { name: '芒果', emoji: '🥭', category: '水果', kcal: 60 },
  { name: '菠萝', emoji: '🍍', category: '水果', kcal: 44 },
  { name: '桃子', emoji: '🍑', category: '水果', kcal: 42 },
  { name: '樱桃', emoji: '🍒', category: '水果', kcal: 46 },
  { name: '哈密瓜', emoji: '🍈', category: '水果', kcal: 34 },
  { name: '火龙果', emoji: '🐉', category: '水果', kcal: 55 },
  { name: '榴莲', emoji: '🐉', category: '水果', kcal: 147 },
  { name: '牛油果', emoji: '🥑', category: '水果', kcal: 171 },
  { name: '柠檬', emoji: '🍋', category: '水果', kcal: 37 },

  // ================= 坚果（高热量） =================
  { name: '花生（炒）', emoji: '🥜', category: '坚果', kcal: 589 },
  { name: '核桃', emoji: '🌰', category: '坚果', kcal: 646 },
  { name: '杏仁', emoji: '🌰', category: '坚果', kcal: 578 },
  { name: '腰果', emoji: '🌰', category: '坚果', kcal: 559 },
  { name: '开心果', emoji: '🌰', category: '坚果', kcal: 614 },
  { name: '葵花籽', emoji: '🌻', category: '坚果', kcal: 606 },
  { name: '夏威夷果', emoji: '🌰', category: '坚果', kcal: 718 },
  { name: '黑芝麻', emoji: '⚫', category: '坚果', kcal: 559 },

  // ================= 零食 / 快餐 / 甜点 =================
  { name: '薯片', emoji: '🍟', category: '零食快餐', kcal: 540 },
  { name: '薯条（炸）', emoji: '🍟', category: '零食快餐', kcal: 298 },
  { name: '汉堡', emoji: '🍔', category: '零食快餐', kcal: 260 },
  { name: '炸鸡', emoji: '🍗', category: '零食快餐', kcal: 270 },
  { name: '披萨', emoji: '🍕', category: '零食快餐', kcal: 260 },
  { name: '热狗', emoji: '🌭', category: '零食快餐', kcal: 280 },
  { name: '三明治', emoji: '🥪', category: '零食快餐', kcal: 250 },
  { name: '巧克力', emoji: '🍫', category: '零食快餐', kcal: 586 },
  { name: '饼干', emoji: '🍪', category: '零食快餐', kcal: 450 },
  { name: '蛋糕', emoji: '🍰', category: '零食快餐', kcal: 347 },
  { name: '甜甜圈', emoji: '🍩', category: '零食快餐', kcal: 452 },
  { name: '冰淇淋', emoji: '🍦', category: '零食快餐', kcal: 207 },
  { name: '爆米花', emoji: '🍿', category: '零食快餐', kcal: 400 },
  { name: '锅巴', emoji: '🍘', category: '零食快餐', kcal: 554 },

  // ================= 饮品 =================
  { name: '可乐', emoji: '🥤', category: '饮品', kcal: 43 },
  { name: '雪碧', emoji: '🥤', category: '饮品', kcal: 41 },
  { name: '珍珠奶茶', emoji: '🧋', category: '饮品', kcal: 85 },
  { name: '含糖饮料（平均）', emoji: '🧃', category: '饮品', kcal: 45 },
  { name: '黑咖啡', emoji: '☕', category: '饮品', kcal: 2 },
  { name: '拿铁（全脂）', emoji: '☕', category: '饮品', kcal: 60 },
  { name: '美式咖啡', emoji: '☕', category: '饮品', kcal: 5 },
  { name: '啤酒', emoji: '🍺', category: '饮品', kcal: 32 },
  { name: '红酒', emoji: '🍷', category: '饮品', kcal: 85 },
  { name: '白酒', emoji: '🍶', category: '饮品', kcal: 298 },
  { name: '运动饮料', emoji: '🧃', category: '饮品', kcal: 26 },
  { name: '蜂蜜', emoji: '🍯', category: '饮品', kcal: 321 }
]

/** 参考库用到的所有分类（保持顺序） */
export const foodRefCategories = [
  '谷薯主食',
  '豆制品',
  '肉类',
  '水产',
  '蛋奶',
  '蔬菜',
  '水果',
  '坚果',
  '零食快餐',
  '饮品'
]
