"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitFileModels } from "@/lib/action/admin/dashboard/form_file_models";
import { checkRole } from "@/lib/check_role";
import { fetcher } from "@/lib/utils";
import { TableData } from "@/src/view/table";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import useSWR from "swr";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { data, isLoading, mutate } = useSWR("/api/admin/file_models", fetcher);
  console.log(data);
  const [formData, formAction, isPending] = useActionState(submitFileModels, {
    sukses: false,
    message: "",
    values: { name: "", foto: "", models: "", uv: "" }
  });
  useEffect(() => {
    setName(formData.values.name);
    if (!formData.sukses && formData.message) {
      setErrorMessage(formData.message);
    }
  }, [formData]);

  useEffect(() => {
    if (formData.sukses) {
      setErrorMessage(formData.message);
      mutate();
      const timer = setTimeout(() => {
        setErrorMessage(""); // hilangkan setelah 3 detik
        setName(""); // reset nama setelah pesan hilang
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [formData.sukses, formData.message]);
  useEffect(() => {
    async function handleRole() {
      const data = await checkRole("admin");
      if (!data) router.push("/");
    }
    handleRole();
  }, [router]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  return (
    <main className='p-4'>
      <div className='flex xl:flex-row flex-col justify-center items-center size-full'>
        <section className='border h-screen w-full flex justify-center items-center'>
          <form action={formAction} className='border  w-96 h-fit gap-2 flex flex-col p-2'>
            <div className='p-5 flex flex-col border w-full space-y-2 '>
              <Label>Nama Model</Label>
              <Input type='text' name='name' value={name} onChange={handleNameChange} />
            </div>
            <div className='p-5 flex flex-col border w-full space-y-2 '>
              <Label htmlFor='foto'>Upload Foto 3D</Label>
              <Input type='file' accept='.png, .jpg, .jpeg' name='foto' />
            </div>
            <div className='p-5 flex flex-col border w-full space-y-2 '>
              <Label htmlFor='models'>Upload Model 3D</Label>
              <Input type='file' accept='.glb, .gltf' name='models' />
            </div>

            <div className='p-5 flex flex-col border w-full space-y-2 '>
              <Label htmlFor='uv'>Upload UV 3D</Label>
              <Input type='file' accept='.jpg, .jpeg, .png' name='uv' />
            </div>

            {errorMessage && <p className={formData.sukses ? "text-green-600" : "text-red-600"}>{errorMessage}</p>}

            <Button type='submit' className='max-w-1/2 self-center' disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </section>

        <section className='border h-screen w-full flex justify-center items-center'>
          <div className='border w-96 h-fit p-2'>
            <TableData data={data} filterKey='name' />
          </div>
        </section>
        <section className='border h-screen w-full flex justify-center items-center'>
          <div className='border size-96'></div>
        </section>
      </div>
    </main>
  );
}
