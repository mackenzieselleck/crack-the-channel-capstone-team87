import Navbar from '@/components/spike/navbar';

export default function SpikeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}