// src/app/page.tsx
'use client'; // This page needs client-side interactivity for navigation

import React from 'react';
import Link from 'next/link'; // Use next/link for client-side navigation
import Image from 'next/image'; // Use next/image for optimized images

export default function LandingPage() {
  return (
      <div
          className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-white text-center p-4"
          style={{ backgroundImage: 'url(/landing-background.jpg)' }} // Image from public folder
      >
        <header className="bg-white bg-opacity-80 p-4 md:px-12 shadow-md fixed top-0 w-full z-50 flex items-center justify-between box-border">
          <div className="text-xl font-bold text-blue-600">Smart House Inventory</div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 text-base">Home</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 text-base">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 text-base">Contact</Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-base hover:bg-blue-700 transition-colors">Log In</button>
            </Link>
            <Link href="/signup">
              <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-base border border-gray-300 hover:bg-gray-200 transition-colors">Register</button>
            </Link>
          </div>
        </header>

        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl text-center max-w-md w-full mt-20">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart House Inventory Manager</h3>
          <p className="text-gray-700 text-lg mb-6">Let's get you back in!</p>
          <div className="flex flex-col space-y-4">
            <Link href="/login">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors w-full">Login</button>
            </Link>
            <div className="mt-4 text-gray-700 text-sm">
              <p className="mb-2">Don't have an account?</p>
              <Link href="/signup">
                <button className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg text-lg border border-gray-300 hover:bg-gray-200 transition-colors w-full">Register</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}