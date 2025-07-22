import Header from "@/src/view/header";
import Link from "next/link";
import React from "react";
import { data_baju } from "@/lib/mock_data";

const ProdukItemPage = () => {
  return (
    <main className='size-full  flex-col flex overflow-hidden border'>
      <Header />
      <section className='flex flex-col border gap-2 p-2 text-primary'>
        <div className='mx-auto flex min-h-[50vh] p-5 gap-2 flex-row container'>
          {data_baju.map((item) => (
            <div className='flex w-full  ' key={item.id}>
              <div className='w-[50vw] h-full justify-center items-center flex  border '>
                <div className='border rounded-2xl h-fit w-96 overflow-clip p-5'>
                  <div className='flex flex-col h-fit'>
                    <img src={item.gambar.toString()} className='w-full h-96 rounded-md'></img>
                  </div>
                </div>
              </div>
              <div className='w-[50vw] text-2xl px-10 pt-10 h-full flex-col flex gap-2  border '>
                <span className='text-3xl font-bold'>{item.brand}</span>
                <span className='text-4xl'>Rp. {item.harga}</span>
                <span className='gap-2 flex'>
                  {item.ukuran.map((v, i) => (
                    <span className='border rounded-sm p-2 text-xl bg-primary-foreground' key={i}>
                      {v}
                    </span>
                  ))}
                </span>
                <span className='gap-2 flex'>
                  {item.warna.map((v, i) => (
                    <span className='border rounded-sm p-2 text-xl bg-primary-foreground' key={i}>
                      {v}
                    </span>
                  ))}
                </span>
                <span className='uppercase'>stok : {item.stok} pcs</span>
                <span className='uppercase'>kriteria : {item.kriteria}</span>
              </div>
            </div>
          ))}
        </div>
        <div className='w-full border min-h-[43.6vh] flex-row flex'>
          <div className=' mx-auto flex gap-2 flex-row container w-full h-full border pt-2 px-20'>
            <div className='size-96 border'>halo</div>
            <div className='size-96 border'>halo</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProdukItemPage;
