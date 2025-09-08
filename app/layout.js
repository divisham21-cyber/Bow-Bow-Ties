import '../styles/globals.css'

export const metadata = {
  title: 'Bow Bow Ties',
  description: 'Premium bow ties for special occasions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
