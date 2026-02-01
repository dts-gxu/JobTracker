/**
 * 投递模板页面 - @author dts
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { templateApi, applicationApi } from '../api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Copy, Bookmark } from 'lucide-react'

export default function Templates() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', companyName: '', positionName: '', workLocation: '', 
    applyChannel: '', salaryMin: '', salaryMax: '', companyWebsite: '', notes: ''
  })

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getAll().then(res => res.data)
  })

  const createMutation = useMutation({
    mutationFn: (data) => templateApi.create(data),
    onSuccess: () => {
      toast.success('模板创建成功')
      queryClient.invalidateQueries(['templates'])
      setShowForm(false)
      setForm({ name: '', companyName: '', positionName: '', workLocation: '', applyChannel: '', salaryMin: '', salaryMax: '', companyWebsite: '', notes: '' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => templateApi.delete(id),
    onSuccess: () => {
      toast.success('删除成功')
      queryClient.invalidateQueries(['templates'])
    }
  })

  const useTemplate = async (template) => {
    const data = {
      companyName: template.companyName || '',
      positionName: template.positionName || '',
      applyDate: new Date().toISOString().split('T')[0],
      status: '已投递',
      workLocation: template.workLocation,
      applyChannel: template.applyChannel,
      salaryMin: template.salaryMin,
      salaryMax: template.salaryMax,
      companyWebsite: template.companyWebsite,
      notes: template.notes,
      priority: 'MEDIUM',
      isStarred: false
    }
    
    try {
      await applicationApi.create(data)
      toast.success('已使用模板创建投递记录')
      navigate('/applications')
    } catch (e) {
      toast.error('创建失败')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('请填写模板名称')
      return
    }
    createMutation.mutate({
      ...form,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
      salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">投递模板</h1>
          <p className="text-gray-500 mt-1">保存常用信息，快速添加投递</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> 新建模板
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">创建新模板</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" className="input" placeholder="模板名称 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="text" className="input" placeholder="公司名称" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <input type="text" className="input" placeholder="职位名称" value={form.positionName} onChange={(e) => setForm({ ...form, positionName: e.target.value })} />
            <input type="text" className="input" placeholder="工作地点" value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })} />
            <select className="input" value={form.applyChannel} onChange={(e) => setForm({ ...form, applyChannel: e.target.value })}>
              <option value="">投递渠道</option>
              {['官网投递', '招聘网站', '内推', '校园招聘', '猎头推荐', '其他'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" className="input" placeholder="薪资下限" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              <input type="number" className="input" placeholder="薪资上限" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
            <input type="url" className="input md:col-span-2" placeholder="公司投递官网" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} />
            <button type="submit" className="btn btn-primary">保存模板</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.id} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary-500" />
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <button onClick={() => deleteMutation.mutate(template.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                {template.companyName && <p>公司: {template.companyName}</p>}
                {template.positionName && <p>职位: {template.positionName}</p>}
                {template.workLocation && <p>地点: {template.workLocation}</p>}
                {template.salaryMin && template.salaryMax && <p>薪资: {template.salaryMin}-{template.salaryMax}K</p>}
              </div>
              
              <button onClick={() => useTemplate(template)} className="btn btn-secondary w-full flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" /> 使用此模板
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Bookmark className="w-10 h-10 mx-auto mb-2" />
            <p>暂无模板，点击上方按钮创建</p>
          </div>
        )}
      </div>
    </div>
  )
}
