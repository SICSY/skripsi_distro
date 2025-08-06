"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  { src: "/icons/next.svg", alt: "Next.js" },
  {
    src: "/icons/react.png",
    alt: "React",
  },
  { src: "/icons/three-js-icon.webp", alt: "Three.js" },
  { src: "/icons/umc.png", alt: "Universitas Muhammadiyah Cirebon" },
];

export default function Marquee() {
  return (
    <div className="relative w-full overflow-hidden py-4 bg-#b1afaf">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />

      <motion.div className="flex whitespace-nowrap gap-16 px-4" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 20 }}>
        {[...Array(3)].flatMap((_, i) =>
          logos.map((logo, j) => (
            <div key={`${logo.alt}-${i}-${j}`} className="flex items-center justify-center min-w-[180px]">
              <Image src={logo.src} alt={logo.alt} width={100} height={100} className="grayscale filter invert hover:grayscale-100 transition duration-300" />
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
