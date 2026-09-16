import './globals.css';

export const metadata = {
  title: 'Police Complaint Portal | पुलिस शिकायत | పోలీస్ ఫిర్యాదు',
  description: 'AI-Powered Multilingual Police Complaint Portal — English, Hindi, Telugu',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy-900 text-slate-200 antialiased">{children}</body>
    </html>
  );
}
