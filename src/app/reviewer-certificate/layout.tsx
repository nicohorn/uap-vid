// Standalone layout for the printable reviewer certificate: no sidebar,
// breadcrumbs or app chrome, so `window.print()` only ever outputs the
// certificate regardless of paper size, orientation or browser.
export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-2xl px-10 py-12">{children}</div>
    </div>
  )
}
