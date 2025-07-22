"use client";
import ModelConfigurator from "./example";

export const Customizer = () => {
  return (
    <div className='customizer  relative  pointer-events-none'>
      <div className=' pt-6 pointer-events-auto w-full h-full'>
        <ModelConfigurator />
      </div>
    </div>
  );
};
