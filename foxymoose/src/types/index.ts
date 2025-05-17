export interface Vendor {
  id: string;
  name: string;
  defaultPercentage: number;
}

export interface Rule {
  id?: string;
  category: string;
  value: string;
  percentageType: 'flat' | 'additive_vendor' | 'additive_publisher' | 'retail_extension';
  percentage: number;
  startDate: string;
  endDate: string;
  note?: string;
  subRules?: SubRule[];
}

export interface SubRule {
  id?: string;
  operator: 'AND' | 'OR';
  category: string;
  value: string;
}

export interface MatchingItem {
  itemSeqId: string;
  title: string;
  category: string;
  type: string;
  speedy: string;
  isbn13: string;
  upc: string;
  price: string;
  matchingRules: string[];
}

export interface VendorSummary {
  vendorName: string;
  defaultPercentage: number;
  ruleCount: number;
}

export interface PricingEditorState {
  selectedVendor: Vendor | null;
  rules: Rule[];
  vendorSummary: VendorSummary[];
  matchingItems: MatchingItem[];
  isLoading: boolean;
  error: string | null;
}

export interface Category {
  value: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { value: 'author', label: 'Author' },
  { value: 'bible_translations', label: 'Bible Translations' },
  { value: 'bible_version', label: 'Bible Version' },
  { value: 'catalog_sections', label: 'Catalog Sections' },
  { value: 'categories', label: 'Categories' },
  { value: 'isbn_13', label: 'ISBN-13' },
  { value: 'item_seq_id', label: 'Item_Seq_ID' },
  { value: 'item_type', label: 'Item Type' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'special', label: 'Special' },
  { value: 'speedy', label: 'Speedy' },
  { value: 'title_keywords', label: 'Title Key Words' },
  { value: 'upc', label: 'UPC' },
];

export const PERCENTAGE_TYPES = [
  { value: 'flat', label: 'Flat Percentage' },
  { value: 'additive_vendor', label: 'Add Percentage to Vendor Buy Discount' },
  { value: 'additive_publisher', label: 'Add Percentage to Publisher Buy Discount' },
  { value: 'retail_extension', label: '% of Retail Price Extension' },
]; 