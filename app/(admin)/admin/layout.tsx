"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ClerkProvider>
      <div className='min-h-screen bg-zinc-950'>
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
          <div className='fixed inset-0 bg-black/50' onClick={() => setSidebarOpen(false)} />
          <div className='fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-700'>
            <div className='flex items-center justify-between p-4 border-b border-zinc-700'>
              <h1 className='text-xl font-bold text-white'>Admin Panel</h1>
              <Button variant='ghost' size='sm' onClick={() => setSidebarOpen(false)}>
                <X className='w-4 h-4' />
              </Button>
            </div>
            <nav className='p-4 space-y-2'>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === item.href ? "bg-blue-600 text-white" : "text-zinc-300 hover:text-white hover:bg-zinc-800")}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className='w-4 h-4' />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className='hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-zinc-900 lg:border-r lg:border-zinc-700 lg:block'>
          <div className='p-4 border-b border-zinc-700'>
            <h1 className='text-xl font-bold text-white'>Admin Panel</h1>
          </div>
          <nav className='p-4 space-y-2'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === item.href ? "bg-blue-600 text-white" : "text-zinc-300 hover:text-white hover:bg-zinc-800")}
              >
                <item.icon className='w-4 h-4' />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className='absolute bottom-4 left-4 right-4'>
            <Button variant='outline' className='w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800 bg-transparent'>
              <LogOut className='w-4 h-4 mr-2' />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className='lg:ml-64'>
          {/* Top bar */}
          <div className='bg-zinc-900 border-b border-zinc-700 px-4 py-3'>
            <div className='flex items-center justify-between'>
              <Button variant='ghost' size='sm' className='lg:hidden text-zinc-300' onClick={() => setSidebarOpen(true)}>
                <Menu className='w-4 h-4' />
              </Button>
              <div className='flex items-center gap-4'>
                <span className='text-sm text-zinc-400'>Welcome back, Admin</span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className='p-6'>{children}</main>
        </div>
      </div>
    </ClerkProvider>
  );
}
