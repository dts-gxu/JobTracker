/**
 * 薪资对比页面 - 最多选5个Offer对比 - @author dts
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts'
import { Plus, X, TrendingUp } from 'lucide-react'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export default function SalaryCompare() {
  const [selectedIds, setSelectedIds] = useState([])

  const { data } = useQuery({
    queryKey: ['applications', 'all'],
    queryFn: () => applicationApi.getAll({ size: 1000 }).then(res => res.data)
  })

  const applications = data?.content || []
  const offersWithSalary = applications.filter(app => app.salaryMin && app.salaryMax)

  const selectedOffers = offersWithSalary.filter(app => selectedIds.includes(app.id))

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id])
    }
  }

  const chartData = selectedOffers.map((app, index) => ({
    name: app.companyName.length > 8 ? app.companyName.slice(0, 8) + '...' : app.companyName,
    min: app.salaryMin,
    max: app.salaryMax,
    range: app.salaryMax - app.salaryMin,
    color: COLORS[index % COLORS.length]
  }))

  const maxSalary = Math.max(...selectedOffers.map(app => app.salaryMax), 10)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">薪资对比</h1>
        <p className="text-gray-500 mt-1">选择最多5个Offer进行薪资对比</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">选择要对比的Offer ({selectedIds.length}/5)</h2>
          
          {offersWithSalary.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {offersWithSalary.map((app, index) => {
                const isSelected = selectedIds.includes(app.id)
                const colorIndex = selectedIds.indexOf(app.id)
                
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleSelect(app.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    } ${!isSelected && selectedIds.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[colorIndex] }}
                          ></div>
                        )}
                        <div>
                          <div className="font-medium">{app.companyName}</div>
                          <div className="text-sm text-gray-500">{app.positionName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-600">{app.salaryMin}-{app.salaryMax}K</div>
                        <div className="text-xs text-gray-400">{app.workLocation}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">没有包含薪资信息的投递记录</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">薪资对比图表</h2>
          
          {selectedOffers.length > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {chartData.map((item, index) => {
                  const percentage = maxSalary > 0 ? (item.max / maxSalary) * 100 : 0
                  const minPercentage = maxSalary > 0 ? (item.min / maxSalary) * 100 : 0
                  const displayWidth = Math.max(percentage - minPercentage, 5)
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{selectedOffers[index]?.companyName}</span>
                        <span className="text-gray-600">{item.min.toLocaleString()}-{item.max.toLocaleString()}K</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg relative overflow-hidden">
                        <div 
                          className="absolute h-full rounded-lg transition-all"
                          style={{ 
                            left: `${minPercentage}%`,
                            width: `${displayWidth}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                            minWidth: '40px'
                          }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                            {item.min}-{item.max}K
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3">
                {selectedOffers.map((app, index) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="font-medium">{app.companyName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">平均: <strong className="text-gray-900">{((app.salaryMin + app.salaryMax) / 2).toFixed(0)}K</strong></span>
                      <button onClick={() => toggleSelect(app.id)} className="text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOffers.length > 1 && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">最高薪资: </span>
                    <span className="font-bold">
                      {selectedOffers.reduce((max, app) => Math.max(max, app.salaryMax), 0)}K
                    </span>
                    <span className="text-sm">
                      ({selectedOffers.find(app => app.salaryMax === Math.max(...selectedOffers.map(a => a.salaryMax)))?.companyName})
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Plus className="w-8 h-8 mb-2" />
              <p>从左侧选择Offer开始对比</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
