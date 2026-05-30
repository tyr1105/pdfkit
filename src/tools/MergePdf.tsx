import { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'

interface PdfFile {
  file: File
  name: string
}

export default function MergePdf() {
  const [files, setFiles] = useState<PdfFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const newFiles = Array.from(e.dataTransfer.files)
      .filter(f => f.type === 'application/pdf')
      .map(f => ({ file: f, name: f.name }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
        .filter(f => f.type === 'application/pdf')
        .map(f => ({ file: f, name: f.name }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const next = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const merge = async () => {
    if (files.length < 2) { setError('至少需要2个PDF文件'); return }
    setProcessing(true)
    setError('')
    try {
      const merged = await PDFDocument.create()
      for (const { file } of files) {
        const bytes = await file.arrayBuffer()
        const doc = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(doc, doc.getPageIndices())
        pages.forEach(p => merged.addPage(p))
      }
      const result = await merged.save()
      saveAs(new Blob([result], { type: 'application/pdf' }), 'merged.pdf')
    } catch (e: any) {
      setError('合并失败: ' + (e.message || '未知错误'))
    }
    setProcessing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">合并PDF</h2>
      <p className="text-gray-500 mb-4">选择多个PDF文件，按顺序合并为一个文件</p>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <div className="text-4xl mb-2">📁</div>
        <p className="text-gray-600">拖拽PDF文件到此处，或</p>
        <label className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          选择文件
          <input type="file" accept=".pdf" multiple onChange={handleSelect} className="hidden" />
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">文件列表（{files.length}个）</h3>
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-700 truncate">
                  <span className="text-gray-400 mr-2">{i + 1}.</span>
                  {f.name}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => moveFile(i, 'up')} disabled={i === 0}
                    className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-30 cursor-pointer">↑</button>
                  <button onClick={() => moveFile(i, 'down')} disabled={i === files.length - 1}
                    className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-30 cursor-pointer">↓</button>
                  <button onClick={() => removeFile(i)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded cursor-pointer">删除</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

      <button
        onClick={merge}
        disabled={files.length < 2 || processing}
        className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {processing ? '处理中...' : '合并PDF'}
      </button>
    </div>
  )
}
