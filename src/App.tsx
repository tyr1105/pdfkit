import { useState } from 'react'
import MergePdf from './tools/MergePdf'
import SplitPdf from './tools/SplitPdf'
import CompressPdf from './tools/CompressPdf'
import WatermarkPdf from './tools/WatermarkPdf'
import ImageToPdf from './tools/ImageToPdf'
import RotatePdf from './tools/RotatePdf'

// 工具定义
const tools = [
  { id: 'merge', name: '合并PDF', desc: '将多个PDF合并为一个文件', icon: '📄+📄' },
  { id: 'split', name: '拆分PDF', desc: '提取指定页面生成新PDF', icon: '✂️' },
  { id: 'compress', name: '压缩PDF', desc: '减小PDF文件体积', icon: '📦' },
  { id: 'watermark', name: '添加水印', desc: '给PDF每页添加文字水印', icon: '💧' },
  { id: 'image2pdf', name: '图片转PDF', desc: '将图片合并转为PDF文件', icon: '🖼️' },
  { id: 'rotate', name: '旋转页面', desc: '旋转PDF页面方向', icon: '🔄' },
] as const

type ToolId = typeof tools[number]['id']

function App() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)

  const renderTool = () => {
    switch (activeTool) {
      case 'merge': return <MergePdf />
      case 'split': return <SplitPdf />
      case 'compress': return <CompressPdf />
      case 'watermark': return <WatermarkPdf />
      case 'image2pdf': return <ImageToPdf />
      case 'rotate': return <RotatePdf />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📑</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PDF工具箱</h1>
              <p className="text-sm text-gray-500">免费在线PDF处理 · 浏览器本地处理 · 隐私安全</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 工具选择 */}
        {!activeTool ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">选择工具</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left cursor-pointer"
                >
                  <div className="text-3xl mb-3">{tool.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
                  <p className="text-sm text-gray-500">{tool.desc}</p>
                </button>
              ))}
            </div>

            {/* 特点说明 */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-800">隐私安全</h3>
                <p className="text-sm text-gray-500 mt-1">文件不会上传到服务器，全部在浏览器本地处理</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-800">快速免费</h3>
                <p className="text-sm text-gray-500 mt-1">无需注册登录，打开即用，永久免费</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-gray-800">全平台支持</h3>
                <p className="text-sm text-gray-500 mt-1">电脑手机平板都能用，支持所有主流浏览器</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setActiveTool(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              ← 返回工具列表
            </button>
            {renderTool()}
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-400 border-t border-gray-200">
        <p>PDF工具箱 · 免费在线PDF处理工具 · 所有文件仅在本地浏览器处理</p>
      </footer>
    </div>
  )
}

export default App
