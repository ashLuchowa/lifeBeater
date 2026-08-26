import "./globals.css";

export const metadata = {
  title: "Dashboard",
  description: "Personal net worth and profile dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
