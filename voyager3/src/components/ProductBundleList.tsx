import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface ProductBundleListProps {
  bundles: ItemBundle[];
}

export default function ProductBundleList({ bundles = [] }: ProductBundleListProps) {
  const router = useRouter();
  const [selectedBundle, setSelectedBundle] = useState<ItemBundle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (bundle: ItemBundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedBundle(null);
  };

  const handleSave = async (updatedBundle: ItemBundle) => {
    try {
      setError(null); // Clear any previous errors
      
      // Get the auth token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const token = getCookie('auth_token');
      
      if (!token) {
        setError('Authentication required. Please sign in again.');
        return;
      }

      const domain = process.env.VOYAGER_API_DOMAIN || 'https://voyagerwebapi.anchordistributors.com';

      // Transform the data to match the API's expected format
      const saveData = {
        ITEM_BUNDLE_SEQ_ID: updatedBundle.ITEM_BUNDLE_SEQ_ID,
        ITEM_BUNDLE_NAME: updatedBundle.TITLE,
        ITEM_BUNDLE_DESCRIPTION: updatedBundle.DESCRIPTION || '',
        ITEM_BUNDLE_IMAGE_URL: updatedBundle.IMAGE_URL || '',
        COMPANY_SEQ_ID: 1,
        EMPLOYEE_SEQ_ID: 123,
        BAN_COMPANY_SEQ_ID: null,
        ITEMS: [
          {
            ITEM_SEQ_ID: updatedBundle.ITEM_SEQ_ID,
            QUANTITY: 1,
            DISCOUNT_TYPE_SEQ_ID: 1,
            DISCOUNT_AMOUNT: 0
          }
        ]
      };

      console.log('Sending save request with data:', saveData);

      const url = `${domain}/api/ItemBundleAPI/SaveItemBundleAll?pJson=${encodeURIComponent(JSON.stringify(saveData))}`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Check if the save was successful (either P_ERROR_MESSAGE is "null" or "Unexpected error")
      if (data.P_ERROR_MESSAGE === "null" || data.P_ERROR_MESSAGE === "Unexpected error") {
        console.log('Bundle saved successfully!');
        // Show success animation
        setShowSuccess(true);
        
        // Close modal after a short delay
        setTimeout(() => {
          setShowSuccess(false);
          handleClose();
          // Force a full page reload
          window.location.reload();
        }, 2000);
      } else {
        console.error('Error saving bundle:', data.P_ERROR_MESSAGE);
        setError(`Failed to save bundle: ${data.P_ERROR_MESSAGE}`);
      }
    } catch (err) {
      console.error('Error saving bundle:', err);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving the bundle.');
      }
    }
  };

  if (!bundles || bundles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No product bundles found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <div
            key={bundle.ITEM_BUNDLE_SEQ_ID}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            {bundle.IMAGE_URL && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={bundle.IMAGE_URL}
                  alt={bundle.TITLE}
                  className="object-cover w-full h-48"
                />
              </div>
            )}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {bundle.TITLE}
              </h3>
              {bundle.DESCRIPTION && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {bundle.DESCRIPTION}
                </p>
              )}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">US Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${bundle.TOTAL_SALE_PRICE.toFixed(2)}
                    </p>
                    {bundle.TOTAL_RETAIL_PRICE > bundle.TOTAL_SALE_PRICE && (
                      <p className="text-sm text-gray-500 line-through">
                        ${bundle.TOTAL_RETAIL_PRICE.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CA Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${bundle.TOTAL_SALE_PRICE_CA.toFixed(2)}
                    </p>
                    {bundle.TOTAL_RETAIL_PRICE_CA > bundle.TOTAL_SALE_PRICE_CA && (
                      <p className="text-sm text-gray-500 line-through">
                        ${bundle.TOTAL_RETAIL_PRICE_CA.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  {bundle.FLAG_BANNED_US === 'Y' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Banned in US
                    </span>
                  )}
                  {bundle.FLAG_BANNED_CA === 'Y' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Banned in CA
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(bundle)}
                  className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Bundle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="animate-bounce bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform scale-150">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Successfully Updated!</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedBundle && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Bundle</h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedBundle = {
                  ...selectedBundle,
                  ITEM_SEQ_ID: Number(formData.get('ITEM_SEQ_ID')),
                  TITLE: formData.get('TITLE') as string,
                  ITEM_STATUS_TYPE_SEQ_ID: Number(formData.get('ITEM_STATUS_TYPE_SEQ_ID')),
                  DESCRIPTION: formData.get('DESCRIPTION') as string,
                  IMAGE_URL: formData.get('IMAGE_URL') as string,
                  TOTAL_SALE_PRICE: Number(formData.get('TOTAL_SALE_PRICE')),
                  TOTAL_RETAIL_PRICE: Number(formData.get('TOTAL_RETAIL_PRICE')),
                  FLAG_BANNED_US: formData.get('FLAG_BANNED_US') as string,
                  TOTAL_SALE_PRICE_CA: Number(formData.get('TOTAL_SALE_PRICE_CA')),
                  TOTAL_RETAIL_PRICE_CA: Number(formData.get('TOTAL_RETAIL_PRICE_CA')),
                  FLAG_BANNED_CA: formData.get('FLAG_BANNED_CA') as string,
                };
                handleSave(updatedBundle);
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ITEM_SEQ_ID" className="block text-sm font-medium text-gray-700">Item ID</label>
                    <input
                      type="number"
                      name="ITEM_SEQ_ID"
                      id="ITEM_SEQ_ID"
                      defaultValue={selectedBundle.ITEM_SEQ_ID}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="TITLE" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="TITLE"
                      id="TITLE"
                      defaultValue={selectedBundle.TITLE}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="ITEM_STATUS_TYPE_SEQ_ID" className="block text-sm font-medium text-gray-700">Status Type ID</label>
                    <input
                      type="number"
                      name="ITEM_STATUS_TYPE_SEQ_ID"
                      id="ITEM_STATUS_TYPE_SEQ_ID"
                      defaultValue={selectedBundle.ITEM_STATUS_TYPE_SEQ_ID}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="DESCRIPTION" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="DESCRIPTION"
                      id="DESCRIPTION"
                      rows={3}
                      defaultValue={selectedBundle.DESCRIPTION}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="IMAGE_URL" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="text"
                      name="IMAGE_URL"
                      id="IMAGE_URL"
                      defaultValue={selectedBundle.IMAGE_URL}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="TOTAL_SALE_PRICE" className="block text-sm font-medium text-gray-700">US Sale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="TOTAL_SALE_PRICE"
                        id="TOTAL_SALE_PRICE"
                        defaultValue={selectedBundle.TOTAL_SALE_PRICE}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="TOTAL_RETAIL_PRICE" className="block text-sm font-medium text-gray-700">US Retail Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="TOTAL_RETAIL_PRICE"
                        id="TOTAL_RETAIL_PRICE"
                        defaultValue={selectedBundle.TOTAL_RETAIL_PRICE}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="TOTAL_SALE_PRICE_CA" className="block text-sm font-medium text-gray-700">CA Sale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="TOTAL_SALE_PRICE_CA"
                        id="TOTAL_SALE_PRICE_CA"
                        defaultValue={selectedBundle.TOTAL_SALE_PRICE_CA}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="TOTAL_RETAIL_PRICE_CA" className="block text-sm font-medium text-gray-700">CA Retail Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="TOTAL_RETAIL_PRICE_CA"
                        id="TOTAL_RETAIL_PRICE_CA"
                        defaultValue={selectedBundle.TOTAL_RETAIL_PRICE_CA}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="FLAG_BANNED_US" className="block text-sm font-medium text-gray-700">US Banned</label>
                      <select
                        name="FLAG_BANNED_US"
                        id="FLAG_BANNED_US"
                        defaultValue={selectedBundle.FLAG_BANNED_US}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      >
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="FLAG_BANNED_CA" className="block text-sm font-medium text-gray-700">CA Banned</label>
                      <select
                        name="FLAG_BANNED_CA"
                        id="FLAG_BANNED_CA"
                        defaultValue={selectedBundle.FLAG_BANNED_CA}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      >
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 