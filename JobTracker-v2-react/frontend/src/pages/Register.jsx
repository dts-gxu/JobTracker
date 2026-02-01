import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { Briefcase, Loader2 } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', realName: '', phone: '', school: '', major: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      toast.error('请填写必填项')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('两次密码输入不一致')
      return
    }
    setLoading(true)
    try {
      await authApi.register(form)
      toast.success('注册成功！请登录')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-2xl">
        <div className="card p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">JobTracker</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">创建账户</h1>
            <p className="text-gray-500 mt-1">开始追踪您的求职之旅</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">用户名 *</label>
                <input type="text" className="input" placeholder="用于登录" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="label">邮箱 *</label>
                <input type="email" className="input" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">密码 *</label>
                <input type="password" className="input" placeholder="至少6位" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="label">确认密码 *</label>
                <input type="password" className="input" placeholder="再次输入密码" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
              <div>
                <label className="label">真实姓名</label>
                <input type="text" className="input" placeholder="选填" value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} />
              </div>
              <div>
                <label className="label">手机号码</label>
                <input type="text" className="input" placeholder="选填" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">学校</label>
                <input type="text" className="input" placeholder="选填" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
              </div>
              <div>
                <label className="label">专业</label>
                <input type="text" className="input" placeholder="选填" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5 text-lg mt-6">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '注册'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            已有账户？ <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
