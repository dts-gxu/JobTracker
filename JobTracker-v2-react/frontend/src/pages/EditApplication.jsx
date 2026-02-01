import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationApi } from '../api'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Building2, DollarSign, Users, Globe } from 'lucide-react'

const STATUS_OPTIONS = ['准备中', '已投递', '笔试', '一面', '二面', '三面', 'HR面', 'Offer', '已拒绝']
const CHANNEL_OPTIONS = ['官网投递', '招聘网站', '内推', '校园招聘', '猎头推荐', '其他']
const PRIORITY_OPTIONS = [{ value: 'HIGH', label: '高' }, { value: 'MEDIUM', label: '中' }, { value: 'LOW', label: '低' }]

export default function EditApplication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationApi.getById(id).then(res => res.data)
  })

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        applyDate: data.applyDate?.split('T')[0] || '',
        interviewTime: data.interviewTime?.slice(0, 16) || '',
        salaryMin: data.salaryMin || '',
        salaryMax: data.salaryMax || ''
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (data) => applicationApi.update(id, data),
    onSuccess: () => {
      toast.success('更新成功！')
      queryClient.invalidateQueries(['applications'])
      navigate('/applications')
    },
    onError: (err) => toast.error(err.response?.data?.message || '更新失败')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.companyName || !form.positionName) {
      toast.error('请填写公司名称和职位名称')
      return
    }
    const submitData = {
      ...form,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
      salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null
    }
    mutation.mutate(submitData)
  }

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }))

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-5 h-5" /> 返回
      </button>

      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">编辑投递记录</h1>
          <p className="text-gray-500 mt-1">{form.companyName} - {form.positionName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-500" /> 基本信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">公司名称 *</label>
                <input type="text" className="input" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} />
              </div>
              <div>
                <label className="label">职位名称 *</label>
                <input type="text" className="input" value={form.positionName} onChange={(e) => update('positionName', e.target.value)} />
              </div>
              <div>
                <label className="label">投递日期 *</label>
                <input type="date" className="input" value={form.applyDate} onChange={(e) => update('applyDate', e.target.value)} />
              </div>
              <div>
                <label className="label">当前状态</label>
                <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">优先级</label>
                <select className="input" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                  {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">投递渠道</label>
                <select className="input" value={form.applyChannel || ''} onChange={(e) => update('applyChannel', e.target.value)}>
                  <option value="">请选择</option>
                  {CHANNEL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Salary & Location */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> 薪资与地点
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="label">薪资下限 (K)</label>
                <input type="number" className="input" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} />
              </div>
              <div>
                <label className="label">薪资上限 (K)</label>
                <input type="number" className="input" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} />
              </div>
              <div>
                <label className="label">工作地点</label>
                <input type="text" className="input" value={form.workLocation || ''} onChange={(e) => update('workLocation', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" /> 联系信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="label">内推人</label>
                <input type="text" className="input" value={form.referrer || ''} onChange={(e) => update('referrer', e.target.value)} />
              </div>
              <div>
                <label className="label">HR联系人</label>
                <input type="text" className="input" value={form.hrContact || ''} onChange={(e) => update('hrContact', e.target.value)} />
              </div>
              <div>
                <label className="label">HR电话</label>
                <input type="text" className="input" value={form.hrPhone || ''} onChange={(e) => update('hrPhone', e.target.value)} />
              </div>
              <div>
                <label className="label">公司投递官网</label>
                <div className="flex gap-2">
                  <input type="url" className="input flex-1" placeholder="https://careers.xxx.com" value={form.companyWebsite || ''} onChange={(e) => update('companyWebsite', e.target.value)} />
                  {form.companyWebsite && (
                    <a href={form.companyWebsite} target="_blank" rel="noopener noreferrer" className="btn btn-secondary px-3 flex items-center">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <div>
                <label className="label">面试时间</label>
                <input type="datetime-local" className="input" value={form.interviewTime} onChange={(e) => update('interviewTime', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <label className="label">备注</label>
            <textarea className="input min-h-[120px]" value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} />
          </section>

          {/* Star */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="starred" className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500" checked={form.isStarred} onChange={(e) => update('isStarred', e.target.checked)} />
            <label htmlFor="starred" className="text-gray-700">标记为星标（重要）</label>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1 py-3">
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '保存修改'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary flex-1 py-3">取消</button>
          </div>
        </form>
      </div>
    </div>
  )
}
