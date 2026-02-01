/**
 * 简历管理页面 - @author dts
 */
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resumeApi } from '../api'
import toast from 'react-hot-toast'
import { Upload, FileText, Trash2, Star, Plus } from 'lucide-react'

export default function Resumes() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [newResume, setNewResume] = useState({ name: '', description: '' })

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeApi.getAll().then(res => res.data)
  })

  const uploadMutation = useMutation({
    mutationFn: (formData) => resumeApi.upload(formData),
    onSuccess: () => {
      toast.success('上传成功')
      queryClient.invalidateQueries(['resumes'])
      setNewResume({ name: '', description: '' })
    },
    onError: () => toast.error('上传失败')
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => resumeApi.delete(id),
    onSuccess: () => {
      toast.success('删除成功')
      queryClient.invalidateQueries(['resumes'])
    }
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id) => resumeApi.setDefault(id),
    onSuccess: () => {
      toast.success('设置成功')
      queryClient.invalidateQueries(['resumes'])
    }
  })

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!newResume.name) {
      toast.error('请先填写简历名称')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', newResume.name)
    formData.append('description', newResume.description)
    
    setUploading(true)
    await uploadMutation.mutateAsync(formData)
    setUploading(false)
    fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">简历管理</h1>
          <p className="text-gray-500 mt-1">管理你的简历文件</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">上传新简历</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            className="input"
            placeholder="简历名称 *"
            value={newResume.name}
            onChange={(e) => setNewResume({ ...newResume, name: e.target.value })}
          />
          <input
            type="text"
            className="input"
            placeholder="简历描述（选填）"
            value={newResume.description}
            onChange={(e) => setNewResume({ ...newResume, description: e.target.value })}
          />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading || !newResume.name}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? '上传中...' : '选择文件上传'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : resumes.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{resume.name}</span>
                      {resume.isDefault && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">默认</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{resume.description || '无描述'}</p>
                    <p className="text-xs text-gray-400">{(resume.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!resume.isDefault && (
                    <button
                      onClick={() => setDefaultMutation.mutate(resume.id)}
                      className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"
                      title="设为默认"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(resume.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <FileText className="w-8 h-8 mb-2" />
            <p>暂无简历，上传你的第一份简历吧</p>
          </div>
        )}
      </div>
    </div>
  )
}
