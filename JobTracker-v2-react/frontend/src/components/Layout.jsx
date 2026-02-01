import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, FileText, Plus, LogOut, Briefcase, FileUp, CalendarDays, TrendingUp, Bookmark, Download } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: '仪表盘' },
    { to: '/applications', icon: FileText, label: '投递记录' },
    { to: '/applications/add', icon: Plus, label: '添加投递' },
    { to: '/calendar', icon: CalendarDays, label: '面试日历' },
    { to: '/salary-compare', icon: TrendingUp, label: '薪资对比' },
    { to: '/templates', icon: Bookmark, label: '投递模板' },
    { to: '/resumes', icon: FileUp, label: '简历管理' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - 固定侧边栏 */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col fixed h-screen">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">JobTracker</h1>
              <p className="text-xs text-slate-400">求职投递追踪系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.realName || user?.username}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-72">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
