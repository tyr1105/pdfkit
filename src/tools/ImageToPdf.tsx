import { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'

interface ImgFile {
  file: File
  name: string
  preview: string
}

export default function ImageToPdf() {
  const [files, setFiles] = useState<ImgFile[]>([])
  const [orientation, setOrientation] = useState<'fit' | 'a4'>('fit')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const addFiles = useCallback(async (newFiles: File[]) => {
    const images: ImgFile[] = []
    for (const f of newFiles) {
      if (!f.type.match(/image\/(png|jpeg|jpg|webp)/)) continue
      images.push({ file: f, name: f.name, preview: URL.createObjectURL(f) })
    }
    setFiles(prev => [...prev, ...images])
  }, [])

  const removeFile = (index: number) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const convert = async () => {
    if (files.length === 0) return
    setProcessing(true)
    setError('')
    try {
      const doc = await PDFDocument.create()
      for (const { file } of files) {
        const bytes = await file.arrayBuffer()
        let image
        if (file.type === 'image/png') {
          image = await doc.embedPng(bytes)
        } else {
          image = await doc.embedJpg(bytes)
        }
        const imgW = image.width
        const imgH = image.height

        if (orientation === 'a4') {
          // A4: 595.28 x 841.89
          const pageW = 595.28
          const pageH = 841.89
          const margin = 36
          const maxW = pageW - margin * 2
          const maxH = pageH - margin * 2
          const scale = Math.min(maxW / imgW, maxH / imgH)
          const drawW = imgW * scale
          const drawH = imgH * scale
          const page = doc.addPage([pageW, pageH])
          page.drawImage(image, {
            x: (pageW - drawW) / 2,
            y: (pageH - drawH) / 2,
            width: drawW,
            height: drawH,
          })
        } else {
          const page = doc.addPage([imgW, imgH])
          page.drawImage(image, { x: 0, y: 0, width: imgW, height: imgH })
        }
      }
      const result = await doc.save()
      saveAs(new Blob([result], { type: 'application/pdf' }), 'images.pdf')
    } catch (e: any) {
      setError('转换失败: ' + (e.message || '未知错误'))
    }
    setProcessing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">图片转PDF</h2>
      <p className="text-gray-500 mb-4">将多张图片合并转为PDF文件（支持PNG、JPG、WebP）</p>

      <div
        onDrop={e => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)) }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50"
      >
        <div className="text-4xl mb-2">🖼️</div>
        <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          选择图片
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple
            onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)) }}
            className="hidden" />
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">{files.length}张图片</h3>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input type="radio" name="orientation" checked={orientation === 'fit'}
                  onChange={() => setOrientation('fit')} />
                原始尺寸
              </label>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input type="radio" name="orientation" checked={orientation === 'a4'}
                  onChange={() => setOrientation('a4')} />
                A4纸张
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative group">
                <img src={f.preview} alt={f.name} className="w-full h-20 object-cover rounded-lg border" />
                <button onClick={() => removeFile(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 cursor-pointer">x</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

      <button
        onClick={convert}
        disabled={files.length === 0 || processing}
        className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
      >
        {processing ? '转换中...' : '转换为PDF'}
      </button>
    </div>
  )
}
