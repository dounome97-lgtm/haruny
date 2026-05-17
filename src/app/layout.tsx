import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하루코치",
  description: "오늘 할 작은 공부를 알려주는 생활형 코치 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
