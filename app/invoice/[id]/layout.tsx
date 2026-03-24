export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f0f2f5] min-h-screen">
        {children}
      </body>
    </html>
  )
}
