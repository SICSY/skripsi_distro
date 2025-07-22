// "use server";
// import fs from "fs";
// import path from "path";
// import { writeFile } from "fs/promises";
// import prisma from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

// export async function submitFileModels(prevState: { sukses: boolean; message: string; values: { name: string; foto: string; models: string; uv: string } }, formData: FormData) {
//   const modelsFile = formData.get("models") as File | null;
//   const uvFile = formData.get("uv") as File | null;
//   const fotoFile = formData.get("foto") as File | null;
//   const name = formData.get("name")?.toString().trim();

//   const values = {
//     name: name ?? "",
//     foto: fotoFile?.name ?? "",
//     models: modelsFile?.name ?? "",
//     uv: uvFile?.name ?? ""
//   };

//   if (!name) return { sukses: false, message: "Nama model harus diisi.", values };
//   if (!fotoFile || !(fotoFile instanceof File) || fotoFile.size === 0) return { sukses: false, message: "Gambar harus diunggah.", values };
//   if (!modelsFile || !(modelsFile instanceof File) || modelsFile.size === 0) return { sukses: false, message: "File model 3D harus diunggah.", values };
//   if (!uvFile || !(uvFile instanceof File) || uvFile.size === 0) return { sukses: false, message: "File UV harus diunggah.", values };

//   const baseFolder = path.join(process.cwd(), "public", "models");
//   const folderFoto = path.join(baseFolder, "foto");
//   const folderName = path.join(baseFolder, "name");
//   const folderUv = path.join(baseFolder, "uv");

//   [baseFolder, folderName, folderFoto, folderUv].forEach((dir) => {
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//   });

//   const modelFileName = `${name}_models.glb`;
//   const fotoFileName = `${name}_foto.png`;
//   const uvFileName = `${name}_uv.png`;
//   const modelFilePath = path.join(folderName, modelFileName);
//   const fotoFilePath = path.join(folderFoto, fotoFileName);
//   const uvFilePath = path.join(folderUv, uvFileName);

//   if (fs.existsSync(modelFilePath)) return { sukses: false, message: `Model "${modelFileName}" sudah ada.`, values };
//   if (fs.existsSync(fotoFilePath)) return { sukses: false, message: `Foto "${fotoFileName} sudah ada`, values };
//   if (fs.existsSync(uvFilePath)) return { sukses: false, message: `UV "${uvFileName}" sudah ada.`, values };

//   try {
//     const modelBuffer = Buffer.from(await modelsFile.arrayBuffer());
//     await writeFile(modelFilePath, modelBuffer);
//   } catch {
//     return { sukses: false, message: "Gagal menyimpan file model.", values };
//   }
//   try {
//     const fotoBuffer = Buffer.from(await fotoFile.arrayBuffer());
//     await writeFile(fotoFilePath, fotoBuffer);
//   } catch {
//     return { sukses: false, message: "Gagal menyimpan file model.", values };
//   }

//   try {
//     const uvBuffer = Buffer.from(await uvFile.arrayBuffer());
//     await writeFile(uvFilePath, uvBuffer);
//   } catch {
//     return { sukses: false, message: "Gagal menyimpan file UV.", values };
//   }

//   try {
//     await prisma.fileModels.create({
//       data: {
//         name: name,
//         foto: `/models/foto/${fotoFileName}`,
//         model_url: `/models/name/${modelFileName}`,
//         uv_url: `/models/uv/${uvFileName}`
//       }
//     });
//   } catch (err) {
//     console.error("Gagal menyimpan ke database:", err);
//     return { sukses: false, message: "Gagal menyimpan ke database.", values };
//   }
//   revalidatePath("/admin");
//   return { sukses: true, message: "File berhasil disimpan.", values: { name: "" } };
// }
