/**
 * 仪表盘页面 - 显示统计数据和图表
 * 
 * @author dts
 * @version 2.0.0
 */
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../api'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { FileText, TrendingUp, Star, Plus, ArrowRight, Briefcase, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import { exportApi } from '../api'

const STATUS_COLORS = {
  '准备中': '#94a3b8', '已投递': '#3b82f6', '笔试': '#8b5cf6', '一面': '#f59e0b',
  '二面': '#f97316', '三面': '#ec4899', 'HR面': '#14b8a6', 'Offer': '#22c55e', '已拒绝': '#ef4444'
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => applicationApi.getStats().then(res => res.data)
  })

  const handleExport = async () => {
    try {
      const response = await exportApi.excel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'job_applications.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e) {
      console.error('导出失败', e)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>
  }

  const pieData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({ name, value }))
  const total = stats?.total || 0
  const offerCount = stats?.byStatus?.['Offer'] || 0
  const rejectedCount = stats?.byStatus?.['已拒绝'] || 0
  const pendingCount = total - offerCount - rejectedCount

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 mt-1">查看您的求职进度概览</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" /> 导出Excel
          </button>
          <Link to="/applications/add" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> 添加投递
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '总投递数', value: total, icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
          { label: '进行中', value: pendingCount, icon: Clock, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50' },
          { label: 'Offer', value: offerCount, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50' },
          { label: '已拒绝', value: rejectedCount, icon: XCircle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bgColor }) => (
          <div key={label} className="card p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
              </div>
              <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center`}>
                <Icon className={`w-7 h-7 bg-gradient-to-r ${color} bg-clip-text text-transparent`} style={{ color: color.includes('blue') ? '#3b82f6' : color.includes('amber') ? '#f59e0b' : color.includes('emerald') ? '#22c55e' : '#ef4444' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">状态分布</h2>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry) => (<Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
          )}
        </div>

        {/* Status Bar Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">各状态数量</h2>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {pieData.map((entry) => (<Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
          )}
        </div>
      </div>

      {/* Starred Applications */}
      {stats?.starred?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> 星标投递
            </h2>
            <Link to="/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.starred.slice(0, 6).map((app) => (
              <div key={app.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.companyName}</h3>
                    <p className="text-sm text-gray-500">{app.positionName}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${STATUS_COLORS[app.status]}20`, color: STATUS_COLORS[app.status] }}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
