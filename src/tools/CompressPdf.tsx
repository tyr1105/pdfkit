import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null)

  const compress = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setResult(null)
    try {
      const bytes = await file.arrayBuffer()
      const originalSize = bytes.byteLength
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })

      // 基础压缩：重新序列化可以去掉一些冗余数据
      // 移除元数据中不必要的信息
      doc.setTitle('')
      doc.setAuthor('')
      doc.setSubject('')
      doc.setKeywords([])
      doc.setProducer('')
      doc.setCreator('')

      const compressed = await doc.save({
        useObjectStreams: true,  // 使用对象流压缩
        addDefaultPage: false,
      })
      const compressedSize = compressed.byteLength

      setResult({ original: originalSize, compressed: compressedSize })
      saveAs(new Blob([compressed], { type: 'application/pdf' }), 'compressed_' + file.name)
    } catch (e: any) {
      setError('压缩失败: ' + (e.message || '未知错误'))
    }
    setProcessing(false)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">压缩PDF</h2>
      <p className="text-gray-500 mb-4">减小PDF文件体积，便于传输和存储</p>

      {!file ? (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
          <div className="text-4xl mb-2">📦</div>
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
            <span className="text-sm text-green-700">已选择: {file.name} ({formatSize(file.size)})</span>
            <button onClick={() => { setFile(null); setResult(null) }}
              className="text-sm text-red-500 hover:text-red-700 cursor-pointer">重新选择</button>
          </div>

          {result && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">原始大小</p>
                  <p className="text-lg font-bold text-gray-900">{formatSize(result.original)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">压缩后</p>
                  <p className="text-lg font-bold text-green-600">{formatSize(result.compressed)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">压缩率</p>
                  <p className="text-lg font-bold text-blue-600">
                    {((1 - result.compressed / result.original) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            onClick={compress}
            disabled={processing}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {processing ? '压缩中...' : '压缩PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
