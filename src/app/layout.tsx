import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'FindIOM',
  description: 'Local services on the Isle of Man',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
