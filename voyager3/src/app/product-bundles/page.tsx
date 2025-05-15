'use client';

import { useEffect, useState } from 'react';
import ProductBundleList from '@/components/ProductBundleList';

interface ItemBundle {
  ITEM_BUNDLE_SEQ_ID: number;
  ITEM_SEQ_ID: number;
  TITLE: string;
  ITEM_STATUS_TYPE_SEQ_ID: number;
  DESCRIPTION: string;
  IMAGE_URL: string;
  TOTAL_SALE_PRICE: number;
  TOTAL_RETAIL_PRICE: number;
  FLAG_BANNED_US: string;
  TOTAL_SALE_PRICE_CA: number;
  TOTAL_RETAIL_PRICE_CA: number;
  FLAG_BANNED_CA: string;
}

interface BundleResponse {
  pCursor: ItemBundle[];
  P_ERROR_MESSAGE: string;
  P_TOTAL_PAGES: string;
}

export default function ProductBundlePage() {
  const [bundles, setBundles] = useState<ItemBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        // Get the auth token from cookies
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };

        const token = getCookie('auth_token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const domain = process.env.VOYAGER_API_DOMAIN || 'https://voyagerwebapi.anchordistributors.com';

        const response = await fetch(`${domain}/api/ItemBundleAPI/GetItemBundle?pPageNumber=1&pPageSize=50&pReturnTotalPages=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        });

        console.log('Response:', response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BundleResponse = await response.json();
        
        // Log the raw response
        console.log('Raw API Response:', JSON.stringify(data, null, 2));
        
        if (data.P_ERROR_MESSAGE === "null") {
          // Process the bundles to handle empty objects
          const processedBundles = data.pCursor.map(bundle => ({
            ...bundle,
            ITEM_STATUS_TYPE_SEQ_ID: typeof bundle.ITEM_STATUS_TYPE_SEQ_ID === 'object' ? 0 : bundle.ITEM_STATUS_TYPE_SEQ_ID,
            DESCRIPTION: typeof bundle.DESCRIPTION === 'object' ? '' : bundle.DESCRIPTION,
            IMAGE_URL: typeof bundle.IMAGE_URL === 'object' ? '' : bundle.IMAGE_URL
          }));
          setBundles(processedBundles);
        } else {
          setError(data.P_ERROR_MESSAGE);
        }
      } catch (err) {
        console.error('Error fetching bundles:', err);
        setError('Failed to load product bundles');
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading product bundles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Product Bundles
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage and view your product bundles
          </p>
        </div>
        <div className="mt-8">
          <ProductBundleList bundles={bundles} />
        </div>
      </div>
    </div>
  );
} 