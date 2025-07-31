import Header from "@/src/view/header";
import Link from "next/link";
import React from "react";

const ProdukItemPage = () => {
  return (
    <main className="size-full  flex-col flex overflow-hidden border">
      <Header />
      <section className="flex flex-col border gap-2 p-2 text-primary">
        <div className="mx-auto flex min-h-[50vh] p-5 gap-2 flex-row container"></div>
        <div className="w-full border min-h-[43.6vh] flex-row flex">
          <div className=" mx-auto flex gap-2 flex-row container w-full h-full border pt-2 px-20">
            <div className="size-96 border">halo</div>
            <div className="size-96 border">halo</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProdukItemPage;
