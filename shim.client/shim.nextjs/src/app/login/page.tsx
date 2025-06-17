// src/app/login/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout'; // Adjusted path for App Router
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import { login as apiLogin } from '@/api/auth'; // Adjusted path
import { useAuth } from '@/hooks/useAuth'; // Adjusted path

const LoginPage: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await apiLogin({ email, password });
            authLogin(response.token, response.userId, response.name, response.email, response.role);

            alert(`Login Successful! Welcome, ${response.name}!`); // Using alert as per previous instruction for notifications

            if (response.role === 'Admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/user/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            alert(`Login Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                <h3 className="text-3xl font-semibold text-gray-900 mb-6">Login</h3>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="text-left">
                        <label htmlFor="email-input" className="block text-gray-700 text-sm font-bold mb-2">
                            Email :
                        </label>
                        <input
                            type="email"
                            id="email-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="example@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="text-left">
                        <label htmlFor="password-input" className="block text-gray-700 text-sm font-bold mb-2">
                            Password :
                        </label>
                        <input
                            type="password"
                            id="password-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors w-full disabled:bg-blue-400"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-6 text-gray-700 text-sm">
                    <p className="mb-2">Don't have an account?</p>
                    <Link href="/signup" className="text-blue-600 hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>
            {loading && <LoadingSpinner fullscreen />}
        </AuthLayout>
    );
};

export default LoginPage;