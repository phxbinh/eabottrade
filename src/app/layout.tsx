// app/layout.tsx
/*
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen overflow-y-auto`}>
        {children}
      </body>
    </html>
  );
}
*/


// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full overflow-auto text-slate-900 bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}





