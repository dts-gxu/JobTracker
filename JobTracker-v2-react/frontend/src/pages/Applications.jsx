/**
 * 投递记录列表页面 - 显示所有投递记录
 * 
 * @author dts
 * @version 2.0.0
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationApi } from '../api'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Search, Plus, Star, Edit2, Trash2, ExternalLink, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_OPTIONS = ['准备中', '已投递', '笔试', '一面', '二面', '三面', 'HR面', 'Offer', '已拒绝']
const STATUS_COLORS = {
  '准备中': 'bg-slate-100 text-slate-700', '已投递': 'bg-blue-100 text-blue-700', '笔试': 'bg-purple-100 text-purple-700',
  '一面': 'bg-amber-100 text-amber-700', '二面': 'bg-orange-100 text-orange-700', '三面': 'bg-pink-100 text-pink-700',
  'HR面': 'bg-teal-100 text-teal-700', 'Offer': 'bg-emerald-100 text-emerald-700', '已拒绝': 'bg-red-100 text-red-700'
}

export default function Applications() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['applications', page, status, keyword],
    queryFn: () => applicationApi.getAll({ page, size: 10, status, keyword }).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => applicationApi.delete(id),
    onSuccess: () => { toast.success('删除成功'); queryClient.invalidateQueries(['applications']) }
  })

  const starMutation = useMutation({
    mutationFn: (id) => applicationApi.toggleStar(id),
    onSuccess: () => queryClient.invalidateQueries(['applications'])
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`确定删除 "${name}" 的投递记录吗？`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">投递记录</h1>
          <p className="text-gray-500 mt-1">管理您的所有求职投递</p>
        </div>
        <Link to="/applications/add" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> 添加投递
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" className="input pl-10" placeholder="搜索公司或职位..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select className="input w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }}>
              <option value="">全部状态</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : data?.content?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['', '公司', '职位', '投递日期', '状态', '薪资', '地点', '操作'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.content.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <button onClick={() => starMutation.mutate(app.id)} className="text-gray-300 hover:text-amber-500 transition-colors">
                          <Star className={`w-5 h-5 ${app.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{app.companyName}</div>
                        {app.companyWebsite && (
                          <a href={app.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                            官网 <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-700">{app.positionName}</td>
                      <td className="px-4 py-4 text-gray-500 text-sm">{format(new Date(app.applyDate), 'yyyy-MM-dd')}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-sm">
                        {app.salaryMin && app.salaryMax ? `${app.salaryMin}-${app.salaryMax}K` : '-'}
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-sm">{app.workLocation || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/applications/${app.id}/edit`} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(app.id, app.companyName)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">共 {data.totalElements} 条记录</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-secondary p-2 disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">第 {page + 1} / {data.totalPages || 1} 页</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= (data.totalPages || 1) - 1} className="btn btn-secondary p-2 disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">暂无投递记录</p>
            <Link to="/applications/add" className="mt-4 btn btn-primary">添加第一条记录</Link>
          </div>
        )}
      </div>
    </div>
  )
}
