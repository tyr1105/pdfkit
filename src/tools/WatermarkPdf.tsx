import { useState } from 'react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import { saveAs } from 'file-saver'

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('机密文件')
  const [fontSize, setFontSize] = useState(50)
  const [opacity, setOpacity] = useState(0.15)
  const [color, setColor] = useState('#999999')
  const [angle, setAngle] = useState(-45)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return rgb(r, g, b)
  }

  const addWatermark = async () => {
    if (!file) return
    if (!text.trim()) { setError('请输入水印文字'); return }
    setProcessing(true)
    setError('')
    try {
      const bytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()

      for (const page of pages) {
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        page.drawText(text, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: hexToRgb(color),
          opacity,
          rotate: degrees(angle),
        })
      }

      const result = await doc.save()
      saveAs(new Blob([result], { type: 'application/pdf' }), 'watermarked_' + file.name)
    } catch (e: any) {
      setError('添加水印失败: ' + (e.message || '未知错误'))
    }
    setProcessing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">添加水印</h2>
      <p className="text-gray-500 mb-4">给PDF每一页添加自定义文字水印</p>

      {!file ? (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
          <div className="text-4xl mb-2">💧</div>
          <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
            选择PDF文件
            <input type="file" accept=".pdf" className="hidden" onChange={e => {
              if (e.target.files?.[0]) { setFile(e.target.files[0]); setError('') }
            }} />
          </label>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-sm text-green-700">已选择: {file.name}</span>
            <button onClick={() => setFile(null)}
              className="text-sm text-red-500 hover:text-red-700 cursor-pointer">重新选择</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">水印文字</label>
              <input type="text" value={text} onChange={e => setText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">字号: {fontSize}</label>
                <input type="range" min={10} max={120} value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">透明度: {(opacity * 100).toFixed(0)}%</label>
                <input type="range" min={0.05} max={0.5} step={0.05} value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角度: {angle}°</label>
                <input type="range" min={-90} max={90} value={angle}
                  onChange={e => setAngle(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <button
            onClick={addWatermark}
            disabled={processing || !text.trim()}
            className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {processing ? '处理中...' : '添加水印'}
          </button>
        </div>
      )}
    </div>
  )
}
