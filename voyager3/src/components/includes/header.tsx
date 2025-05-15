'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

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

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to check auth state
  const checkAuthState = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const storedUserDetails = getCookie('user_details');
    if (storedUserDetails) {
      try {
        setUserDetails(JSON.parse(storedUserDetails));
      } catch (e) {
        console.error('Error parsing stored user details:', e);
        setUserDetails(null);
      }
    } else {
      setUserDetails(null);
    }
    setIsLoading(false);
  };

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  // Check auth state when pathname changes
  useEffect(() => {
    if (!isLoading) {
      checkAuthState();
    }
  }, [pathname]);

  const handleSignOut = () => {
    // Remove cookies by setting their expiration to the past
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'registry_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_details=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUserDetails(null);
    router.refresh();
  };

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Voyager
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                href="/backend-credits"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/backend-credits')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Backend Credits
              </Link>
              <Link
                href="/product-bundles"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/product-bundles')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Product Bundles
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : userDetails ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {userDetails.P_USERNAME}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 