// src/app/signup/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout'; // Adjusted path
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import { signup as apiSignup } from '@/api/auth'; // Adjusted path
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import { SignUpRequestDto } from '@/types'; // Adjusted path

const SignUpPage: FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // Maps to No_Telp (Field E)
    const [address, setAddress] = useState(''); // Maps to Alamat (Field F)
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        const signupData: SignUpRequestDto = {
            nama_Peminjam: name,
            email: email,
            password: password,
            no_Telp: phoneNumber || undefined, // Optional
            alamat: address || undefined,     // Optional
        };

        try {
            const response = await apiSignup(signupData);
            authLogin(response.token, response.userId, response.name, response.email, response.role);

            alert(`Sign Up Successful! Welcome, ${response.name}!`); // Using alert for notifications
            router.push('/user/dashboard'); // New users are typically regular users
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            alert(`Sign Up Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
                <h3 className="text-3xl font-semibold text-gray-900 mb-6">Sign up</h3>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="text-left">
                        <label htmlFor="name-input" className="block text-gray-700 text-sm font-bold mb-2">
                            Name :
                        </label>
                        <input
                            type="text"
                            id="name-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="text-left">
                        <label htmlFor="confirm-password-input" className="block text-gray-700 text-sm font-bold mb-2">
                            Confirm Password :
                        </label>
                        <input
                            type="password"
                            id="confirm-password-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="text-left">
                        <label htmlFor="phone-input" className="block text-gray-700 text-sm font-bold mb-2">
                            Field E (Phone Number) :
                        </label>
                        <input
                            type="tel" // Use type="tel" for phone numbers
                            id="phone-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="e.g., 081234567890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    <div className="text-left">
                        <label htmlFor="address-input" className="block text-gray-700 text-sm font-bold mb-2">
                            Field F (Address) :
                        </label>
                        <textarea
                            id="address-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="Your address"
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors w-full disabled:bg-blue-400"
                        disabled={loading}
                    >
                        {loading ? 'Signing up...' : 'Confirm'}
                    </button>
                </form>
                <div className="mt-6 text-gray-700 text-sm">
                    <p className="mb-2">Already have an account?</p>
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </div>
            </div>
            {loading && <LoadingSpinner fullscreen />}
        </AuthLayout>
    );
};

export default SignUpPage;