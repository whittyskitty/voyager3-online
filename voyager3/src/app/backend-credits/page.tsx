import { VendorBackendCreditsManager } from '@/components/vendor-backend-credits-manager'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Vendor Backend Credits Manager</h1>
      <VendorBackendCreditsManager />
    </main>
  )
}
