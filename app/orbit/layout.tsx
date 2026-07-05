export const metadata = {
  title: "Orbit Admin",
  robots: { index: false, follow: false },
};

export default function OrbitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f0c] text-white antialiased">
      {children}
    </div>
  );
}
