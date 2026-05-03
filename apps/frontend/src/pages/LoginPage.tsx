import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.token, res.user);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-lg font-bold text-white">M</div>
          <div>
            <p className="text-white font-bold text-lg leading-none">MCIA</p>
            <p className="text-gray-500 text-xs">Change Impact Analyzer</p>
          </div>
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="dev@mcia.local" className="input" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-600">
            <p className="text-xs text-gray-600 mb-2">Demo accounts (password: password123):</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {['dev@mcia.local', 'architect@mcia.local', 'release@mcia.local', 'admin@mcia.local'].map(e => (
                <span key={e} className="text-gray-500 font-mono truncate">{e}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
