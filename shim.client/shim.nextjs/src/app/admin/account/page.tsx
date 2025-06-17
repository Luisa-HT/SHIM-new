// src/app/admin/account/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import PrivateLayout from '@/components/PrivateLayout'; // Adjusted path
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import { getAdminProfile, updateAdminProfile, updateAdminEmail, updateAdminPassword } from '@/api/admin'; // Adjusted path
import { AdminProfileDto, UpdateAdminProfileDto, UpdateEmailDto, UpdatePasswordDto } from '@/types'; // Adjusted path

const AdminAccountPage: FC = () => {
    const { user, login: authLogin } = useAuth();
    const [profile, setProfile] = useState<AdminProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    // State for form inputs
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedProfile = await getAdminProfile();
                setProfile(fetchedProfile);
                setName(fetchedProfile.nama_Admin);
                setPhone(fetchedProfile.no_Telp || '');
            } catch (err: any) {
                setError(err.message || 'Failed to fetch admin profile.');
                alert(`Error: ${err.message || 'Failed to fetch admin profile.'}`);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'Admin') {
            fetchProfile();
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updateData: UpdateAdminProfileDto = {
                nama_Admin: name,
                no_Telp: phone || undefined,
            };
            await updateAdminProfile(updateData);
            alert('Profile Updated: Your admin profile information has been successfully updated.');
            setEditMode(false);
            if (profile) {
                setProfile({ ...profile, ...updateData });
                if (user && user.name !== name) {
                    authLogin(user.token, user.userId, name, user.email, user.role);
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            alert(`Update Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updateData: UpdateEmailDto = { newEmail };
            await updateAdminEmail(updateData);
            alert('Email Updated: Your email address has been successfully updated. You may need to re-login.');
            setEmailModalVisible(false);
            if (profile && user) {
                setProfile({ ...profile, email: newEmail });
                authLogin(user.token, user.userId, user.name, newEmail, user.role);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            alert(`Email Update Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match.');
            setLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            const updateData: UpdatePasswordDto = {
                currentPassword,
                newPassword,
            };
            await updateAdminPassword(updateData);
            alert('Password Updated: Your password has been successfully updated.');
            setPasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            alert(`Password Update Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !profile) {
        return <LoadingSpinner fullscreen />;
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Admin Account Info</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Info</h2>
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Profile Picture</span>
                        <div className="flex items-center space-x-3">
                            <span className="text-gray-600 text-sm">A profile picture helps personalize your account</span>
                            <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl">
                                {profile.nama_Admin ? profile.nama_Admin[0].toUpperCase() : 'A'}
                            </div>
                            <button
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300 transition-colors"
                                onClick={() => alert('Feature Coming Soon: Profile picture upload is not yet implemented.')}
                            >
                                Edit
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <label htmlFor="name-input" className="font-semibold text-gray-700 w-1/4">Name</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    id="name-input"
                                    className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            ) : (
                                <span className="text-gray-900 w-3/4">{profile.nama_Admin}</span>
                            )}
                        </div>

                        {/* Status, Institute, Studies are not in backend DTO based on schema */}
                        {/* These fields were part of the design but not the DB schema. */}

                        <div className="flex justify-end pt-4">
                            {editMode ? (
                                <div className="space-x-3">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={loading}>
                                        Save
                                    </button>
                                    <button type="button" onClick={() => { setEditMode(false); setName(profile.nama_Admin); setPhone(profile.no_Telp || ''); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setEditMode(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Edit Personal Info
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Info</h2>
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-700 w-1/4">Email</span>
                        <div className="flex items-center space-x-3 w-3/4">
                            <span className="text-gray-900">{profile.email}</span>
                            <button
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300 transition-colors"
                                onClick={() => setEmailModalVisible(true)}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <label htmlFor="phone-input-contact" className="font-semibold text-gray-700 w-1/4">Phone</label>
                        {editMode ? (
                            <input
                                type="tel"
                                id="phone-input-contact"
                                className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        ) : (
                            <span className="text-gray-900 w-3/4">{profile.no_Telp || 'N/A'}</span>
                        )}
                    </div>
                    {/* Address is not in Admin schema, so it's not displayed/editable here */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setPasswordModalVisible(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Update Modal */}
            {emailModalVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Update Email</h3>
                        <form onSubmit={handleEmailUpdate} className="flex flex-col space-y-4">
                            <div className="text-left">
                                <label htmlFor="new-email-input" className="block text-gray-700 text-sm font-bold mb-2">
                                    New Email
                                </label>
                                <input
                                    type="email"
                                    id="new-email-input"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setEmailModalVisible(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={loading}>
                                    Update Email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Update Modal */}
            {passwordModalVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordUpdate} className="flex flex-col space-y-4">
                            <div className="text-left">
                                <label htmlFor="current-password-input" className="block text-gray-700 text-sm font-bold mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="current-password-input"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="new-password-input" className="block text-gray-700 text-sm font-bold mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="new-password-input"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="confirm-new-password-input" className="block text-gray-700 text-sm font-bold mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirm-new-password-input"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setPasswordModalVisible(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={loading}>
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {loading && <LoadingSpinner fullscreen />}
        </div>
    );
};

export default AdminAccountPage;