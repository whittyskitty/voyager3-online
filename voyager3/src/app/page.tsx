'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface RegistryResponse {
  P_TOKEN: string;
  P_REGISTRY_ID: string;
  P_ERROR_MESSAGE: string;
}

interface UserDetails {
  P_USERNAME: string;
  P_EMAIL: string;
  P_EMPLOYEE_ID: string;
  P_COMPANY_ID: string;
  P_POSITION_LEVEL_ID: string;
  P_LAST_SIGN_IN: string;
  P_LAST_TOKEN_AUTHENTICATION: string;
  P_TOKEN_EXPIRES: string;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    // Check for existing auth token and user details
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const token = getCookie('auth_token');
    const storedUserDetails = getCookie('user_details');
    
    if (token && storedUserDetails) {
      try {
        setUserDetails(JSON.parse(storedUserDetails));
      } catch (e) {
        console.error('Error parsing stored user details:', e);
      }
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RegistryResponse = await response.json();
      console.log('API Response:', data);
      
      if (data.P_ERROR_MESSAGE === "null") {
        // Store the token as a cookie
        document.cookie = `auth_token=${data.P_TOKEN}; path=/; max-age=${365 * 24 * 60 * 60}`;
        document.cookie = `registry_id=${data.P_REGISTRY_ID}; path=/; max-age=${365 * 24 * 60 * 60}`;
        setSuccess(true);
        
        // Fetch user details using GetApiRegistry
        try {
          const registryResponse = await fetch('/api/registry', {
            method: 'GET',
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${data.P_TOKEN}`,
            },
          });
          
          if (registryResponse.ok) {
            const registryData = await registryResponse.json();
            console.log('Registry Data:', registryData);
            setUserDetails(registryData);
            document.cookie = `user_details=${JSON.stringify(registryData)}; path=/; max-age=${365 * 24 * 60 * 60}`;
          }
        } catch (registryError) {
          console.error('Error fetching registry details:', registryError);
        }
      } else {
        setError('Authentication failed. Please check your email and try again.');
      }
    } catch (err) {
      console.error('Full error details:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Remove cookies by setting their expiration to the past
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'registry_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_details=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUserDetails(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Voyager 3
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            We are exited to announce that we are launching a new product called Voyager 3. This product is a new way to interact with all that Anchor Distributors has to offer.
          </p>
        </div>

        {userDetails ? (
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Welcome, {userDetails.P_USERNAME}</h2>
                <p className="mt-2 text-sm text-gray-500">Last sign in: {userDetails.P_LAST_SIGN_IN}</p>
                <button
                  onClick={handleSignOut}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSignIn}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-green-600 text-sm">
                    Successfully signed in!
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {/* Backend Credits Card */}
            <Link 
              href="/backend-credits"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Backend Credits
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage vendor backend credits and pricing rules
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>

            {/* Product Bundle Card */}
            <Link 
              href="/product-bundles"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Product Bundles
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create and manage product bundles and their pricing
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
