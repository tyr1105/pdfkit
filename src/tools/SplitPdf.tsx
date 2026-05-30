import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [rangeInput, setRangeInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (f: File) => {
    if (f.type !== 'application/pdf') { setError('请选择PDF文件'); return }
    setFile(f)
    setError('')
    try {
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const count = doc.getPageCount()
      setPageCount(count)
      setRangeInput('1-' + count)
    } catch (e: any) {
      setError('无法读取PDF: ' + (e.message || '未知错误'))
    }
  }

  const parseRanges = (input: string, max: number): number[] => {
    const pages = new Set<number>()
    for (const part of input.split(',')) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number)
        for (let i = Math.max(1, start); i <= Math.min(max, end); i++) pages.add(i)
      } else {
        const n = Number(trimmed)
        if (n >= 1 && n <= max) pages.add(n)
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }

  const split = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    try {
      const bytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const pages = parseRanges(rangeInput, pageCount)
      if (pages.length === 0) { setError('请输入有效页码'); setProcessing(false); return }

      const indices = pages.map(p => p - 1)
      const newDoc = await PDFDocument.create()
      const copied = await newDoc.copyPages(doc, indices)
      copied.forEach(p => newDoc.addPage(p))
      const result = await newDoc.save()
      saveAs(new Blob([result], { type: 'application/pdf' }), 'split.pdf')
    } catch (e: any) {
      setError('拆分失败: ' + (e.message || '未知错误'))
    }
    setProcessing(false)
  }

  const splitAll = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    try {
      const bytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const zip = new JSZip()
      for (let i = 0; i < doc.getPageCount(); i++) {
        const newDoc = await PDFDocument.create()
        const [page] = await newDoc.copyPages(doc, [i])
        newDoc.addPage(page)
        const result = await newDoc.save()
        zip.file('page_' + (i + 1) + '.pdf', result)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, 'split_pages.zip')
    } catch (e: any) {
      setError('拆分失败: ' + (e.message || '未知错误'))
    }
    setProcessing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">拆分PDF</h2>
      <p className="text-gray-500 mb-4">提取指定页面或拆分每一页</p>

      {!file ? (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
          <div className="text-4xl mb-2">📄</div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">提取页面范围</label>
            <input
              type="text"
              value={rangeInput}
              onChange={e => setRangeInput(e.target.value)}
              placeholder="例: 1-3, 5, 7-10"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">支持格式: 1-5（范围）, 3（单页）, 1-3,5,7-10（混合）</p>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={split}
              disabled={processing}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {processing ? '处理中...' : '提取选中页面'}
            </button>
            <button
              onClick={splitAll}
              disabled={processing}
              className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {processing ? '处理中...' : '每页拆分为单独PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
