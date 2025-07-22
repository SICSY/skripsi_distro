"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Package, ShoppingCart, DollarSign, Eye, MoreHorizontal } from "lucide-react";
import { useDashboardStats } from "@/src/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const statusColors = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500"
};

export default function AdminDashboard() {
  const { data, error, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className='bg-zinc-900 border-zinc-700'>
              <CardHeader className='pb-2'>
                <Skeleton className='h-4 w-20 bg-zinc-700' />
                <Skeleton className='h-8 w-16 bg-zinc-700' />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Skeleton className='h-96 bg-zinc-800' />
          <Skeleton className='h-96 bg-zinc-800' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-400'>Failed to load dashboard data</p>
        <Button onClick={() => window.location.reload()} className='mt-4'>
          Retry
        </Button>
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-white'>Dashboard</h1>
        <p className='text-zinc-400'>Overview of your business metrics</p>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='bg-zinc-900 border-zinc-700'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-300'>Total Orders</CardTitle>
            <ShoppingCart className='h-4 w-4 text-zinc-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-white'>{stats?.overview.totalOrders || 0}</div>
            <p className='text-xs text-zinc-400'>+{stats?.overview.recentOrders || 0} from last month</p>
          </CardContent>
        </Card>

        <Card className='bg-zinc-900 border-zinc-700'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-300'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-zinc-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-white'>Rp {Number(stats?.overview.totalRevenue || 0).toLocaleString("id-ID")}</div>
            <p className='text-xs text-zinc-400'>
              <TrendingUp className='inline h-3 w-3 mr-1' />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='bg-zinc-900 border-zinc-700'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-300'>Total Customers</CardTitle>
            <Users className='h-4 w-4 text-zinc-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-white'>{stats?.overview.totalCustomers || 0}</div>
            <p className='text-xs text-zinc-400'>
              <TrendingUp className='inline h-3 w-3 mr-1' />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='bg-zinc-900 border-zinc-700'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-300'>Total Products</CardTitle>
            <Package className='h-4 w-4 text-zinc-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-white'>{stats?.overview.totalProducts || 0}</div>
            <p className='text-xs text-zinc-400'>Active products</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Orders by Status */}
        <Card className='bg-zinc-900 border-zinc-700'>
          <CardHeader>
            <CardTitle className='text-white'>Orders by Status</CardTitle>
            <CardDescription className='text-zinc-400'>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats?.ordersByStatus?.map((item: any) => (
                <div key={item.status} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className={`w-3 h-3 rounded-full ${statusColors[item.status as keyof typeof statusColors]}`} />
                    <span className='text-sm text-zinc-300 capitalize'>{item.status.toLowerCase()}</span>
                  </div>
                  <Badge variant='outline' className='border-zinc-600 text-zinc-300'>
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className='bg-zinc-900 border-zinc-700'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-white'>Top Products</CardTitle>
              <CardDescription className='text-zinc-400'>Best selling products</CardDescription>
            </div>
            <Link href='/admin/products'>
              <Button variant='outline' size='sm' className='border-zinc-600 text-zinc-300 bg-transparent'>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats?.topProducts?.slice(0, 5).map((product: any) => (
                <div key={product.id} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    {product.photo ? (
                      <img src={product.photo || "/placeholder.svg"} alt={product.name} className='w-8 h-8 rounded object-cover' />
                    ) : (
                      <div className='w-8 h-8 bg-zinc-700 rounded flex items-center justify-center'>
                        <Package className='w-4 h-4 text-zinc-400' />
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-medium text-white'>{product.name}</p>
                      <p className='text-xs text-zinc-400'>{product.orderCount} orders</p>
                    </div>
                  </div>
                  <Button variant='ghost' size='sm'>
                    <MoreHorizontal className='w-4 h-4' />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className='bg-zinc-900 border-zinc-700'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-white'>Recent Orders</CardTitle>
            <CardDescription className='text-zinc-400'>Latest customer orders</CardDescription>
          </div>
          <Link href='/admin/orders'>
            <Button variant='outline' size='sm' className='border-zinc-600 text-zinc-300 bg-transparent'>
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {stats?.recentOrders?.slice(0, 5).map((order: any) => (
              <div key={order.id} className='flex items-center justify-between p-4 bg-zinc-800 rounded-lg'>
                <div className='flex items-center gap-4'>
                  <div>
                    <p className='text-sm font-medium text-white'>#{order.orderId}</p>
                    <p className='text-xs text-zinc-400'>{order.customer.name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-zinc-300'>{order.productKustom?.name}</p>
                    <p className='text-xs text-zinc-400'>{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}>{order.status}</Badge>
                  <p className='text-sm font-medium text-white'>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</p>
                  <Link href={`/admin/orders/${order.orderId}`}>
                    <Button variant='ghost' size='sm'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
