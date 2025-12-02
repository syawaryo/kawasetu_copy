import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { OcrDataProvider } from "./contexts/OcrDataContext";
import ClientLayout from "./components/ClientLayout";

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "川崎設備デモ",
  description: "川崎設備管理システムデモアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>
        <AuthProvider>
          <DataProvider>
            <OcrDataProvider>
              <ClientLayout>{children}</ClientLayout>
            </OcrDataProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
