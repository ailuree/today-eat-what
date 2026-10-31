/**
 * 从 public/favicon.svg 生成 PWA 所需的 PNG 图标
 * 在 npm run dev / build 前自动执行（predev / prebuild 钩子）
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'favicon.svg'))
const outDir = join(root, 'public', 'icons')

// 显式创建输出目录：CI 中 PNG 被 .gitignore 忽略，空目录不会进入仓库，
// 而 sharp 的 toFile 不会自动创建父目录，需先 mkdir（recursive 兼容目录已存在）
mkdirSync(outDir, { recursive: true })

const targets = [
  { name: 'pwa-192.png', size: 192 },
  { name: 'pwa-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
]

for (const t of targets) {
  await sharp(svg).resize(t.size, t.size).png().toFile(join(outDir, t.name))
}

console.log(`✓ 已生成 ${targets.length} 个 PNG 图标到 public/icons`)
