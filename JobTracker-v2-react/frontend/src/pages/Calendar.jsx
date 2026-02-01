/**
 * 面试日历页面 - @author dts
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, Plus, Edit2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  '准备中': 'bg-slate-500', '已投递': 'bg-blue-500', '笔试': 'bg-purple-500', '一面': 'bg-amber-500',
  '二面': 'bg-orange-500', '三面': 'bg-pink-500', 'HR面': 'bg-teal-500', 'Offer': 'bg-emerald-500', '已拒绝': 'bg-red-500'
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const { data } = useQuery({
    queryKey: ['applications', 'all'],
    queryFn: () => applicationApi.getAll({ size: 1000 }).then(res => res.data)
  })

  const applications = data?.content || []
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDay = (day) => {
    return applications.filter(app => {
      if (app.interviewTime) {
        return isSameDay(new Date(app.interviewTime), day)
      }
      return false
    })
  }

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">面试日历</h1>
        <p className="text-gray-500 mt-1">查看你的面试安排</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn btn-secondary p-2">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentMonth(new Date())} className="btn btn-secondary px-3">今天</button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn btn-secondary p-2">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
            ))}
            
            {Array(monthStart.getDay()).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="h-24"></div>
            ))}
            
            {days.map(day => {
              const events = getEventsForDay(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-24 p-1 border rounded-lg cursor-pointer transition-all ${
                    isToday(day) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-300'
                  } ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className={`text-sm font-medium ${isToday(day) ? 'text-primary-600' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1 mt-1">
                    {events.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs text-white px-1 py-0.5 rounded truncate ${STATUS_COLORS[event.status] || 'bg-gray-500'}`}
                      >
                        {event.companyName}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500">+{events.length - 2} 更多</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {selectedDate ? format(selectedDate, 'M月d日 EEEE', { locale: zhCN }) : '选择日期查看详情'}
            </h3>
            <Link to="/applications/add" className="btn btn-primary btn-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> 添加面试
            </Link>
          </div>
          
          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map(event => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[event.status] || 'bg-gray-500'}`}></span>
                      <span className="font-medium">{event.companyName}</span>
                    </div>
                    <Link to={`/applications/${event.id}/edit`} className="text-gray-400 hover:text-primary-500">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600">{event.positionName}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {format(new Date(event.interviewTime), 'HH:mm')}
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[event.status]?.replace('bg-', 'bg-opacity-20 text-')}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                {selectedDate ? '当天没有面试安排' : '点击日期查看面试详情'}
              </p>
              <p className="text-sm text-gray-500">
                💡 在"添加投递"页面填写<strong>面试时间</strong>即可在日历显示
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
