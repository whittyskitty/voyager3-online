'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Vendor {
  VENDOR_SEQ_ID: number;
  VENDOR_CODE: string;
  COMPANY_NAME: string;
  STREET: string;
  CITY: string;
  STATE: string;
  ZIPCODE: string;
  BILLING_FREQUENCY: string;
  COMPANY_LONG_NAME: string;
  COMPANY_ADDRESS: string;
  DISCOUNT_THRESHOLD_PERCENT: number;
  NORMAL_BUY_DISCOUNT_PERCENT: number | {};
  VENDOR_TYPE: string;
}

interface VendorResponse {
  REF_CURSOR: Vendor[];
}

interface VendorRule {
  VENDOR_BACKEND_CREDIT_RULE_SEQ_ID: number;
  CREDIT_PERCENT: number;
  NOTES: string | null;
  EFFECTIVE_FROM: string;
  EFFECTIVE_TO: string | null;
  CREDIT_PERCENT_FLAG_EXTRA: string;
  FIFO_BUY_AT_DISCOUNT_THRESHHOLD: number | null;
  TYPE_ID: string;
  VALUE: string;
}

interface VendorRulesResponse {
  REF_CURSOR: VendorRule[];
}

interface RuleCondition {
  VENDOR_BACKEND_CREDIT_RULE_SEQ_ID: number;
  TYPE_ID: string;
  VALUE: string;
}

interface RuleConditionsResponse {
  REF_CURSOR: RuleCondition[];
}

export function VendorBackendCreditsManager() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [rules, setRules] = useState<VendorRule[]>([]);
  const [defaultPercentage, setDefaultPercentage] = useState<number>(0);
  const [ruleConditions, setRuleConditions] = useState<{ [key: number]: RuleCondition[] }>({});

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      console.log('Component - Selected vendor changed:', selectedVendor);
      fetchRules(selectedVendor);
      const vendor = vendors.find(v => v.VENDOR_SEQ_ID.toString() === selectedVendor);
      console.log('Component - Found vendor:', vendor);
      if (vendor) {
        setDefaultPercentage(vendor.DISCOUNT_THRESHOLD_PERCENT);
      }
    }
  }, [selectedVendor, vendors]);

  const fetchVendors = async () => {
    try {
      console.log('Component - Fetching vendors');
      const response = await fetch('https://voyagerwebapi.anchordistributors.com/api/VendorBackendCreditAPI/ListBackendCreditVendors');
      console.log('Component - API Response status:', response.status);
      const data: VendorResponse = await response.json();
      setVendors(data.REF_CURSOR);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchRules = async (vendorId: string) => {
    try {
      console.log('Component - Fetching rules for vendor:', vendorId);
      const response = await fetch(`https://voyagerwebapi.anchordistributors.com/api/VendorBackendCreditAPI/ListBackendCreditVendorRules?pVendorSeqId=${vendorId}`);
      console.log('Component - API Response status:', response.status);
      const data: VendorRulesResponse = await response.json();
      console.log('Component - Received rules data:', data);
      setRules(data.REF_CURSOR);
    } catch (error) {
      console.error('Component - Error fetching rules:', error);
    }
  };

  const fetchRuleConditions = async (vendorId: string, ruleId: number) => {
    try {
      console.log('Component - Fetching conditions for rule:', ruleId);
      const response = await fetch(`/api/vendors/${vendorId}/rules/${ruleId}/conditions`);
      console.log('Component - Conditions API Response status:', response.status);
      const data: RuleConditionsResponse = await response.json();
      console.log('Component - Received conditions data:', data);
      setRuleConditions(prev => ({
        ...prev,
        [ruleId]: data.REF_CURSOR
      }));
    } catch (error) {
      console.error('Component - Error fetching rule conditions:', error);
    }
  };

  useEffect(() => {
    if (selectedVendor && rules.length > 0) {
      // Fetch conditions for each rule
      rules.forEach(rule => {
        fetchRuleConditions(selectedVendor, rule.VENDOR_BACKEND_CREDIT_RULE_SEQ_ID);
      });
    }
  }, [selectedVendor, rules]);

  return (
    <div className="space-y-8">
      {/* Important Notes */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Backend Credit Reporting needs to use values at time of sale, not current values. All data required for backend credits must be stored at the Order Item level and not called from the Item Level.</p>
              <p>Vendor List Should Include All Vendors in our system.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Selection */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Vendor</h2>
          <div className="max-w-xl">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select a vendor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.VENDOR_SEQ_ID} value={vendor.VENDOR_SEQ_ID}>
                  {vendor.COMPANY_NAME} ({vendor.VENDOR_CODE})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Default Percentage */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Vendor Default Percentage</h2>
          <div className="max-w-xs">
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                value={defaultPercentage}
                onChange={(e) => setDefaultPercentage(Number(e.target.value))}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Pricing Rules</h2>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add New Rule
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-6">
            {rules.map((rule) => (
              <div key={rule.VENDOR_BACKEND_CREDIT_RULE_SEQ_ID} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Rule {rule.VENDOR_BACKEND_CREDIT_RULE_SEQ_ID}</h3>
                  <button className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Rule Content */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type ID</label>
                    <select
                      value={rule.TYPE_ID}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="keyword">Keyword</option>
                      <option value="category">Category</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value</label>
                    <input
                      type="text"
                      value={rule.VALUE}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter value..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credit Percent</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={rule.CREDIT_PERCENT || ''}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        step="0.01"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <input
                      type="text"
                      value={rule.NOTES || ''}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Effective From</label>
                    <input
                      type="date"
                      value={typeof rule.EFFECTIVE_FROM === 'string' ? rule.EFFECTIVE_FROM.split('T')[0] : ''}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Effective To</label>
                    <input
                      type="date"
                      value={typeof rule.EFFECTIVE_TO === 'string' ? rule.EFFECTIVE_TO.split('T')[0] : ''}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Extra Credit Flag</label>
                    <select
                      value={rule.CREDIT_PERCENT_FLAG_EXTRA}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">FIFO Buy at Discount Threshold</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={rule.FIFO_BUY_AT_DISCOUNT_THRESHHOLD || ''}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Conditions Section */}
                  <div className="col-span-full">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions</h4>
                    <div className="space-y-4">
                      {ruleConditions[rule.VENDOR_BACKEND_CREDIT_RULE_SEQ_ID]?.map((condition, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <select
                            value={condition.TYPE_ID}
                            className="mt-1 block w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="keyword">Keyword</option>
                            <option value="category">Category</option>
                            <option value="product">Product</option>
                          </select>
                          <input
                            type="text"
                            value={condition.VALUE}
                            className="mt-1 flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter value..."
                          />
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                        Add Condition
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 