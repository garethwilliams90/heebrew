import "../globals.css";

export default function InstrumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-full p-8">{children}</body>
    </html>
  );
}
