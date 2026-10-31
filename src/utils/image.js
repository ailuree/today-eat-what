/**
 * 图片本地压缩：读取文件 → 等比缩放至长边 maxEdge → 输出 JPEG dataURL
 * 用于菜品贴图，控制 IndexedDB 占用
 */
export function compressImage(file, maxEdge = 512, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxEdge || height > maxEdge) {
          if (width >= height) {
            height = Math.round((height * maxEdge) / width)
            width = maxEdge
          } else {
            width = Math.round((width * maxEdge) / height)
            height = maxEdge
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}
