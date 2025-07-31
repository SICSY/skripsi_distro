"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHighlight, AiOutlineShopping } from "react-icons/ai";
import { useSnapshot } from "valtio";
import { Suspense, useEffect } from "react";
import { IconBase } from "react-icons";
import { state } from "@/src/state/valtio/State";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { App, Customizer } from "@/src/view/scene/customizer";
import Header from "@/src/view/header";
import ModelConfigurator, { Scene } from "./(user)/transaction/page";
import dynamic from "next/dynamic";
import { KaosModel } from "@/src/view/scene/Kaos";
import { Center, OrbitControls, Resize } from "@react-three/drei";
import Marquee from "@/src/view/section/marquee";

const View = dynamic(() => import("@/src/dom/View").then((mod) => mod.View), { ssr: false });

const page = () => {
  const snap = useSnapshot(state);
  const router = useRouter();
  const transition = { type: "spring", duration: 0.8 };
  const config = {
    initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
    exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } }
  };
  useEffect(() => {
    if (!snap.intro) {
      router.replace("?step=customize", { scroll: false }); // hanya ubah URL
    } else {
      router.replace("/", { scroll: false });
    }
  }, [snap.intro]);
  return (
    <div className='h-full relative w-full'>
      <div className='fixed pointer-events-auto bg-zinc-950'>
        <View className=' w-screen h-screen pointer-events-auto'>
          <ambientLight intensity={0.5} />

          <Center>
            <Suspense fallback={null}>
              <Resize>
                <KaosModel />
              </Resize>
              <gridHelper />
            </Suspense>
          </Center>

          <OrbitControls />
        </View>
      </div>
      <div className={`size-full relative `}>
        <Header />
        <div className=' w-full h-full  '>
          {/* <App /> */}
          <div className='overflow-hidden  z-10 pointer-events-none absolute  top-0 left-0 w-full h-full '>
            <AnimatePresence>
              {snap.intro ? (
                <motion.section className='text-white main-section' key='main' {...config}>
                  <div className='section--container'>
                    <motion.div key='title' initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", damping: 5, stiffness: 40, restDelta: 0.001, duration: 0.3 }}>
                      <h1>LET'S DO IT.</h1>
                    </motion.div>
                    <div className='support--content'>
                      <motion.div
                        key='p'
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          type: "spring",
                          damping: 7,
                          stiffness: 30,
                          restDelta: 0.001,
                          duration: 0.6,
                          delay: 0.2,
                          delayChildren: 0.2
                        }}
                      >
                        <p>
                          Create your unique and exclusive shirt with our brand-new 3D customization tool. <strong>Unleash your imagination</strong> and define your own style.
                        </p>
                        <button
                          className='z-20 button-effect'
                          style={{ background: snap.color }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            state.intro = false;
                          }}
                        >
                          CUSTOMIZE IT <AiOutlineHighlight size='1.3em' />
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.section>
              ) : (
                <motion.section className='main-section w-full pt-18' key='custom' {...config}>
                  <Customizer />
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className=' h-screen w-full overflow-hidden  bg-[#dfd9c2]'>
          {/* <div className='h-20 w-full border  bg-zinc-950 clip rotate-180 '></div> */}
          <div className='rotate-180'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'>
              <path
                fill-opacity='1'
                d='M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'
              ></path>
            </svg>
          </div>
        </div>
        <Marquee />
      </div>
    </div>
  );
};

export default page;
