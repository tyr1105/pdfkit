import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { saveAs } from 'file-saver'

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null)
  const [rotation, setRotation] = useState(90)
  const [pageCount, setPageCount] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (f: File) => {
    if (f.type !== 'application/pdf') { setError('请选择PDF文件'); return }
    setFile(f)
    setError('')
    try {
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      setPageCount(doc.getPageCount())
    } catch (e: any) {
      setError('无法读取PDF: ' + (e.message || '未知错误'))
    }
  }

  const rotate = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    try {
      const bytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const pages = doc.getPages()
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + rotation))
      })
      const result = await doc.save()
      saveAs(new Blob([result], { type: 'application/pdf' }), 'rotated_' + file.name)
    } catch (e: any) {
      setError('旋转失败: ' + (e.message || '未知错误'))
    }
    setProcessing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">旋转页面</h2>
      <p className="text-gray-500 mb-4">旋转PDF所有页面的方向</p>

      {!file ? (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
          <div className="text-4xl mb-2">🔄</div>
          <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
            选择PDF文件
            <input type="file" accept=".pdf" className="hidden" onChange={e => {
              if (e.target.files?.[0]) handleFile(e.target.files[0])
            }} />
          </label>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-sm text-green-700">已选择: {file.name} ({pageCount}页)</span>
            <button onClick={() => { setFile(null); setPageCount(0) }}
              className="text-sm text-red-500 hover:text-red-700 cursor-pointer">重新选择</button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">旋转角度</label>
            <div className="flex gap-3">
              {[
                { value: 90, label: '顺时针90°', icon: '↻' },
                { value: 180, label: '180°', icon: '↻↻' },
                { value: 270, label: '逆时针90°', icon: '↺' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRotation(opt.value)}
                  className={'flex-1 py-3 rounded-lg border-2 font-medium cursor-pointer ' +
                    (rotation === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300')}
                >
                  <div className="text-2xl">{opt.icon}</div>
                  <div className="text-sm mt-1">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            onClick={rotate}
            disabled={processing}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {processing ? '处理中...' : '旋转PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
