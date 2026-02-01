import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', rememberMe: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('请填写用户名和密码')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data.token, data.user)
      toast.success('登录成功！')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">JobTracker</span>
          </div>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            轻松管理<br />求职投递
          </h2>
          <p className="text-xl text-white/80">追踪每一份投递，把握每一个机会</p>
        </div>
        
        <div className="relative z-10 grid grid-cols-3 gap-4 text-center">
          {[['100+', '支持公司'], ['9种', '状态追踪'], ['实时', '数据统计']].map(([num, label]) => (
            <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{num}</div>
              <div className="text-sm text-white/70">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">JobTracker</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">欢迎回来</h1>
            <p className="text-gray-500 mt-2">登录您的账户继续</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">用户名</label>
              <input
                type="text"
                className="input"
                placeholder="请输入用户名"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div>
              <label className="label">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="请输入密码"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  checked={form.rememberMe}
                  onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                />
                <span className="text-sm text-gray-600">记住我</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5 text-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '登录'}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            还没有账户？{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
