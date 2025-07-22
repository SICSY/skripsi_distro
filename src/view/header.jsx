// "use client";
// import Link from "next/link";
// import React, { use, useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { useSnapshot } from "valtio";
// import { state } from "../state/valtio/State";
// import { AiOutlineShopping } from "react-icons/ai";
// import { SignedIn, SignedOut, SignIn, SignInButton, UserButton, useSignIn, useUser } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";

// const Header = () => {
//   const router = useRouter();
//   const snap = useSnapshot(state);
//   const transition = { type: "spring", duration: 0.8 };
//   const [role, setRole] = useState(null);
//   const { user, isLoaded } = useUser();
//   useEffect(() => {
//     if (isLoaded && user) {
//       const userRole = user.publicMetadata?.role;
//       setRole(userRole || null);
//     }
//   }, [isLoaded, user]);
//   return (
//     <motion.header
//       className=' w-full z-[999] top-0 text-2xl bg-zinc-900 text-white pointer-events-auto overflow-hidden backdrop-blur  border-neutral-200 dark:bg-black/50 dark:border-neutral-700'
//       initial={{ opacity: 0, y: -50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={transition}
//     >
//       <div className='max-w-7xl mx-auto px-6 py-3 flex justify-between items-center'>
//         {/* Logo or Title */}
//         <motion.div className='text-xl font-boldcursor-pointer' whileHover={{ scale: 1.1 }} transition={transition}>
//           <div onClick={() => (snap.intro == false ? (state.intro = true) : router.push("/"))}>{snap.intro ? "Home" : "Kembali"}</div>
//         </motion.div>
//         <div className='flex items-center gap-5'>
//           <motion.div whileHover={{ scale: 1.1 }} transition={transition} className='text-base font-medium  hover:text-red-600'>
//             <Link href='/produk'>Produk</Link>
//           </motion.div>
//           <motion.div whileHover={{ scale: 1.1 }} transition={transition} className='text-base font-medium  hover:text-red-600'>
//             <Link href='/transaction'>Transaction</Link>
//           </motion.div>

//           {role && (
//             <motion.div whileHover={{ scale: 1.1 }} transition={transition} className='text-base font-medium  hover:text-red-600'>
//               <Link href={"/admin"}>Admin Dashbaord</Link>
//             </motion.div>
//           )}
//         </div>
//         {/* Navigation Links */}
//         <div className='flex    justify-center items-center'>
//           {/* Cart Icon */}
//           <motion.div whileHover={{ scale: 1.2, color: "#dc2626" }} transition={transition} className='w-fit text-5xl  cursor-pointer  dark:text-white' onClick={() => router.push("/checkout")}>
//             <AiOutlineShopping />
//           </motion.div>
//           <motion.div className=' text-base w-full flex justify-self items-center md:ml-20 ml-2'>
//             <SignedOut>
//               <motion.div whileHover={{ scale: 1.1 }} className=' font-medium    dark:text-white hover:text-red-600'>
//                 {<SignInButton mode='modal'>Sign In</SignInButton>}
//               </motion.div>
//             </SignedOut>
//             {/* Tampilkan UserButton jika sudah login */}
//             <SignedIn>
//               <UserButton
//                 appearance={{
//                   elements: {
//                     userButtonAvatarBox: "!size-10"
//                   }
//                 }}
//               />
//             </SignedIn>
//           </motion.div>
//         </div>
//       </div>
//     </motion.header>
//   );
// };

// export default Header;
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSnapshot } from "valtio";
import { state } from "../state/valtio/State";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Home, Package, Receipt, Settings, ShoppingCart, Menu } from "lucide-react";

const Header = () => {
  const router = useRouter();
  const snap = useSnapshot(state);
  const transition = { type: "spring", duration: 0.8 };
  const [role, setRole] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role;
      setRole(userRole || null);
    }
  }, [isLoaded, user]);

  const handleLogoClick = () => {
    if (snap.intro === false) {
      state.intro = true;
    } else {
      router.push("/");
    }
  };

  const menuItems = [
    {
      href: "/produk",
      label: "Produk",
      icon: Package,
    },
    {
      href: "/kustomisasi",
      label: "Kustomisasi",
      icon: Package,
    },
    {
      href: "/transaction",
      label: "Transaksi",
      icon: Receipt,
    },
    ...(role
      ? [
          {
            href: "/admin",
            label: "Admin Dashboard",
            icon: Settings,
            badge: role,
          },
        ]
      : []),
  ];

  return (
    <motion.header className=" w-full top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4 sm:gap-8">
        {/* Logo Section */}
        <motion.div className="cursor-pointer transition-all duration-300" whileHover={{ scale: 1.05 }} transition={transition} onClick={handleLogoClick}>
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{snap.intro ? "CustomWear" : "Kembali"}</span>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex  items-center gap-1">
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <motion.div className="flex flex-row" whileHover={{ scale: 1.05 }} transition={transition}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                        item.href === "/admin" ? "text-primary hover:text-primary/80 hover:bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </motion.div>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card border-border w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-lg font-bold text-foreground">
                  <Home className="w-5 h-5 text-primary" />
                  CustomWear
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8">
                <nav className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-ring"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Cart Button */}
          <motion.div whileHover={{ scale: 1.1 }} transition={transition}>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200" onClick={() => router.push("/checkout")}>
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </motion.div>

          <Separator orientation="vertical" className="h-6 bg-border hidden sm:block" />

          {/* Authentication */}
          <div className="flex items-center">
            <SignedOut>
              <motion.div whileHover={{ scale: 1.05 }} transition={transition}>
                <SignInButton mode="modal">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-200 shadow-sm">Sign In</Button>
                </SignInButton>
              </motion.div>
            </SignedOut>

            <SignedIn>
              <motion.div whileHover={{ scale: 1.05 }} transition={transition}>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10 ring-2 ring-border transition-all duration-200 hover:ring-primary",
                      userButtonPopoverCard: "bg-card border-border shadow-lg",
                      userButtonPopoverActionButton: "text-muted-foreground hover:text-foreground hover:bg-accent",
                    },
                  }}
                />
              </motion.div>
            </SignedIn>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
