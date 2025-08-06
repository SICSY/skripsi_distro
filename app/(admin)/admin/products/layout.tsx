import { ClerkProvider } from "@clerk/nextjs";

export default function Layout({ produk, kustomisasi }: { kustomisasi: React.ReactNode; produk: React.ReactNode }) {
  return (
    <ClerkProvider>
      <div className='flex flex-col md:flex-row w-full h-full gap-6'>
        <div className='w-full md:w-1/2'>{produk}</div>
        <div className='w-full md:w-1/2'>{kustomisasi}</div>
      </div>
    </ClerkProvider>
  );
}
