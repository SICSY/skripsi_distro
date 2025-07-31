// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Download, RefreshCw } from "lucide-react";
// import { useAnalytics } from "@/src/hooks/use-admin";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";

// const periodOptions = [
//   { value: "24h", label: "Last 24 Hours" },
//   { value: "7d", label: "Last 7 Days" },
//   { value: "30d", label: "Last 30 Days" },
//   { value: "90d", label: "Last 90 Days" }
// ];

// export default function AnalyticsPage() {
//   const [period, setPeriod] = useState("7d");
//   const { data, error, isLoading } = useAnalytics(period);

//   const exportAnalytics = () => {
//     if (!data?.data) return;

//     console.log(data);
//     const analytics = data.data;
//     const csvContent = [
//       ["Metric", "Value", "Period"].join(","),
//       ["Total Revenue", analytics.revenue.total, period],
//       ["Total Orders", analytics.orders.total, period],
//       ["New Customers", analytics.customers.new, period],
//       ["Returning Customers", analytics.customers.returning, period],
//       ["Conversion Rate", `${analytics.customers.conversionRate.toFixed(2)}%`, period],
//       "",
//       ["Top Products", "", ""],
//       ["Product Name", "Orders", "Revenue"],
//       ...analytics.products.top.map((product: any) => [product.name, product.orderCount, product.revenue])
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `analytics-${period}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//     toast.success("Analytics exported successfully");
//   };

//   const formatCurrency = (amount: number) => {
//     return `Rp ${amount.toLocaleString("id-ID")}`;
//   };

//   const formatPercentage = (value: number) => {
//     return `${value.toFixed(1)}%`;
//   };

//   if (error) {
//     return (
//       <div className='text-center py-12'>
//         <p className='text-red-400'>Failed to load analytics</p>
//         <Button onClick={() => window.location.reload()} className='mt-4'>
//           <RefreshCw className='w-4 h-4 mr-2' />
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className='space-y-6'>
//       {/* Header */}
//       <div className='flex items-center justify-between'>
//         <div>
//           <h1 className='text-3xl font-bold text-white'>Analytics</h1>
//           <p className='text-zinc-400'>Business insights and performance metrics</p>
//         </div>
//         <div className='flex gap-2'>
//           <Select value={period} onValueChange={setPeriod}>
//             <SelectTrigger className='w-48 bg-zinc-800 border-zinc-600 text-white'>
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent className='bg-zinc-800 border-zinc-600'>
//               {periodOptions.map((option) => (
//                 <SelectItem key={option.value} value={option.value} className='text-white'>
//                   {option.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Button onClick={exportAnalytics} variant='outline' className='border-zinc-600 text-zinc-300 bg-transparent'>
//             <Download className='w-4 h-4 mr-2' />
//             Export
//           </Button>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className='space-y-6'>
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
//             {[...Array(4)].map((_, i) => (
//               <Card key={i} className='bg-zinc-900 border-zinc-700'>
//                 <CardHeader className='pb-2'>
//                   <Skeleton className='h-4 w-20 bg-zinc-700' />
//                   <Skeleton className='h-8 w-16 bg-zinc-700' />
//                 </CardHeader>
//               </Card>
//             ))}
//           </div>
//           <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
//             <Skeleton className='h-96 bg-zinc-800' />
//             <Skeleton className='h-96 bg-zinc-800' />
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Key Metrics */}
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
//             <Card className='bg-zinc-900 border-zinc-700'>
//               <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//                 <CardTitle className='text-sm font-medium text-zinc-300'>Total Revenue</CardTitle>
//                 <DollarSign className='h-4 w-4 text-zinc-400' />
//               </CardHeader>
//               <CardContent>
//                 <div className='text-2xl font-bold text-white'>{formatCurrency(data?.data?.revenue?.total || 0)}</div>
//                 <p className='text-xs text-green-400 flex items-center mt-1'>
//                   <TrendingUp className='w-3 h-3 mr-1' />
//                   +12% from previous period
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className='bg-zinc-900 border-zinc-700'>
//               <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//                 <CardTitle className='text-sm font-medium text-zinc-300'>Total Orders</CardTitle>
//                 <ShoppingCart className='h-4 w-4 text-zinc-400' />
//               </CardHeader>
//               <CardContent>
//                 <div className='text-2xl font-bold text-white'>{data?.data?.orders?.total || 0}</div>
//                 <p className='text-xs text-green-400 flex items-center mt-1'>
//                   <TrendingUp className='w-3 h-3 mr-1' />
//                   +8% from previous period
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className='bg-zinc-900 border-zinc-700'>
//               <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//                 <CardTitle className='text-sm font-medium text-zinc-300'>New Customers</CardTitle>
//                 <Users className='h-4 w-4 text-zinc-400' />
//               </CardHeader>
//               <CardContent>
//                 <div className='text-2xl font-bold text-white'>{data?.data?.customers?.new || 0}</div>
//                 <p className='text-xs text-green-400 flex items-center mt-1'>
//                   <TrendingUp className='w-3 h-3 mr-1' />
//                   +15% from previous period
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className='bg-zinc-900 border-zinc-700'>
//               <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//                 <CardTitle className='text-sm font-medium text-zinc-300'>Conversion Rate</CardTitle>
//                 <Package className='h-4 w-4 text-zinc-400' />
//               </CardHeader>
//               <CardContent>
//                 <div className='text-2xl font-bold text-white'>{formatPercentage(data?.data?.customers?.conversionRate || 0)}</div>
//                 <p className='text-xs text-red-400 flex items-center mt-1'>
//                   <TrendingDown className='w-3 h-3 mr-1' />
//                   -2% from previous period
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
//             {/* Revenue Chart */}
//             <Card className='bg-zinc-900 border-zinc-700'>
//               <CardHeader>
//                 <CardTitle className='text-white'>Revenue Trend</CardTitle>
//                 <CardDescription className='text-zinc-400'>Daily revenue for the selected period</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className='space-y-4'>
//                   {data?.data?.revenue?.data?.map((item: any, index: number) => (
//                     <div key={index} className='flex items-center justify-between p-3 bg-zinc-800 rounded-lg'>
//                       <div>
//                         <p className='text-sm text-zinc-300'>
//                           {new Date(item.date).toLocaleDateString("id-ID", {
//                             month: "short",
//                             day: "numeric"
//                           })}
//                         </p>
//                         <p className='text-xs text-zinc-400'>{item.orders} orders</p>
//                       </div>
//                       <div className='text-right'>
//                         <p className='font-medium text-white'>{formatCurrency(item.revenue)}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Top Products */}
//             <Card className='bg-zinc-900 border-zinc-700'>
//               <CardHeader>
//                 <CardTitle className='text-white'>Top Products</CardTitle>
//                 <CardDescription className='text-zinc-400'>Best performing products by orders</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className='space-y-4'>
//                   {data?.data?.products?.top.slice(0, 5).map((product: any, index: number) => (
//                     <div key={product.id} className='flex items-center justify-between p-3 bg-zinc-800 rounded-lg'>
//                       <div className='flex items-center gap-3'>
//                         <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold'>{index + 1}</div>
//                         {product.photo ? (
//                           <img src={product?.photo || "/placeholder.svg"} alt={product.name} className='w-10 h-10 rounded object-cover' />
//                         ) : (
//                           <div className='w-10 h-10 bg-zinc-700 rounded flex items-center justify-center'>
//                             <Package className='w-5 h-5 text-zinc-400' />
//                           </div>
//                         )}
//                         <div>
//                           <p className='font-medium text-white'>{product.name}</p>
//                           <p className='text-xs text-zinc-400'>{product.orderCount} orders</p>
//                         </div>
//                       </div>
//                       <div className='text-right'>
//                         <p className='font-medium text-white'>{formatCurrency(product.revenue)}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Customer Analytics */}
//           <Card className='bg-zinc-900 border-zinc-700'>
//             <CardHeader>
//               <CardTitle className='text-white'>Customer Analytics</CardTitle>
//               <CardDescription className='text-zinc-400'>Customer acquisition and retention metrics</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
//                 <div className='text-center p-6 bg-zinc-800 rounded-lg'>
//                   <div className='text-3xl font-bold text-blue-400 mb-2'>{data?.data.customers.new || 0}</div>
//                   <p className='text-sm text-zinc-300'>New Customers</p>
//                   <p className='text-xs text-zinc-400 mt-1'>First-time buyers</p>
//                 </div>
//                 <div className='text-center p-6 bg-zinc-800 rounded-lg'>
//                   <div className='text-3xl font-bold text-green-400 mb-2'>{data?.data.customers.returning || 0}</div>
//                   <p className='text-sm text-zinc-300'>Returning Customers</p>
//                   <p className='text-xs text-zinc-400 mt-1'>Repeat buyers</p>
//                 </div>
//                 <div className='text-center p-6 bg-zinc-800 rounded-lg'>
//                   <div className='text-3xl font-bold text-purple-400 mb-2'>{formatPercentage(data?.data.customers.conversionRate || 0)}</div>
//                   <p className='text-sm text-zinc-300'>Conversion Rate</p>
//                   <p className='text-xs text-zinc-400 mt-1'>Orders per customer</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Users, Package, Download, RefreshCw, Palette, Activity, BarChart3 } from "lucide-react";
import { useAnalytics } from "@/src/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const periodOptions = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" }
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7d");
  const { data, error, isLoading, mutate } = useAnalytics(period);

  const exportAnalytics = () => {
    if (!data?.data) return;

    const analytics = data.data;
    const csvContent = [
      ["Metric", "Value", "Period"].join(","),
      ["Total Revenue", analytics.revenue.total, period],
      ["Total Orders", analytics.orders.total, period],
      ["New Customers", analytics.customers.new, period],
      ["Returning Customers", analytics.customers.returning, period],
      ["Conversion Rate", `${analytics.customers.conversionRate.toFixed(2)}%`, period],
      ["Custom Orders", analytics.orders.byType.kustom.count, period],
      ["Regular Orders", analytics.orders.byType.regular.count, period],
      "",
      ["Top Products", "", ""],
      ["Product Name", "Type", "Orders", "Revenue"],
      ...analytics.products.top.map((product: any) => [product.name, product.type, product.orderCount, product.revenue])
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${period}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Analytics exported successfully");
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-400'>Failed to load analytics</p>
        <p className='text-zinc-500 text-sm mt-2'>{error.message || "Unknown error occurred"}</p>
        <Button onClick={() => mutate()} className='mt-4'>
          <RefreshCw className='w-4 h-4 mr-2' />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Analytics</h1>
          <p className='text-zinc-400'>Business insights and performance metrics</p>
        </div>
        <div className='flex gap-2'>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className='w-48 bg-zinc-800 border-zinc-600 text-white'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-zinc-800 border-zinc-600'>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className='text-white'>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant='outline' className='border-zinc-600 text-zinc-300 bg-transparent' disabled={isLoading || !data}>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
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
      ) : (
        <>
          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-zinc-300'>Total Revenue</CardTitle>
                <DollarSign className='h-4 w-4 text-zinc-400' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-white'>{formatCurrency(data?.data?.revenue?.total || 0)}</div>
                <p className='text-xs text-zinc-400 mt-1'>
                  Custom: {formatCurrency(data?.data?.orders?.byType?.kustom?.revenue || 0)} | Regular: {formatCurrency(data?.data?.orders?.byType?.regular?.revenue || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-zinc-300'>Total Orders</CardTitle>
                <ShoppingCart className='h-4 w-4 text-zinc-400' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-white'>{data?.data?.orders?.total || 0}</div>
                <div className='flex gap-2 mt-1'>
                  <Badge variant='outline' className='text-xs bg-purple-900 border-purple-600'>
                    <Palette className='w-3 h-3 mr-1' />
                    {data?.data?.orders?.byType?.kustom?.count || 0} Custom
                  </Badge>
                  <Badge variant='outline' className='text-xs bg-blue-900 border-blue-600'>
                    <Package className='w-3 h-3 mr-1' />
                    {data?.data?.orders?.byType?.regular?.count || 0} Regular
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-zinc-300'>Total Customers</CardTitle>
                <Users className='h-4 w-4 text-zinc-400' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-white'>{data?.data?.customers?.total || 0}</div>
                <p className='text-xs text-zinc-400 mt-1'>
                  New: {data?.data?.customers?.new || 0} | Returning: {data?.data?.customers?.returning || 0}
                </p>
              </CardContent>
            </Card>

            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-zinc-300'>Conversion Rate</CardTitle>
                <BarChart3 className='h-4 w-4 text-zinc-400' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-white'>{formatPercentage(data?.data?.customers?.conversionRate || 0)}</div>
                <p className='text-xs text-zinc-400 mt-1'>Orders per customer</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Revenue Chart */}
            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader>
                <CardTitle className='text-white'>Revenue Trend</CardTitle>
                <CardDescription className='text-zinc-400'>Daily revenue for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {data?.data?.revenue?.data?.length > 0 ? (
                    data.data.revenue.data.map((item: any, index: number) => (
                      <div key={index} className='flex items-center justify-between p-3 bg-zinc-800 rounded-lg'>
                        <div>
                          <p className='text-sm text-zinc-300'>
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              month: "short",
                              day: "numeric"
                            })}
                          </p>
                          <p className='text-xs text-zinc-400'>{item.orders} orders</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium text-white'>{formatCurrency(item.revenue)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-zinc-400'>
                      <BarChart3 className='w-12 h-12 mx-auto mb-2' />
                      <p>No revenue data for this period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader>
                <CardTitle className='text-white'>Top Products</CardTitle>
                <CardDescription className='text-zinc-400'>Best performing products by orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {data?.data?.products?.top?.length > 0 ? (
                    data.data.products.top.slice(0, 5).map((product: any, index: number) => (
                      <div key={`${product.type}-${product.id}`} className='flex items-center justify-between p-3 bg-zinc-800 rounded-lg'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold'>{index + 1}</div>
                          {product.photo ? (
                            <img src={product.photo || "/placeholder.svg"} alt={product.name} className='w-10 h-10 rounded object-cover' />
                          ) : (
                            <div className='w-10 h-10 bg-zinc-700 rounded flex items-center justify-center'>{product.type === "kustom" ? <Palette className='w-5 h-5 text-purple-400' /> : <Package className='w-5 h-5 text-blue-400' />}</div>
                          )}
                          <div>
                            <div className='flex items-center gap-2'>
                              <p className='font-medium text-white'>{product.name}</p>
                              <Badge variant='outline' className={`text-xs ${product.type === "kustom" ? "bg-purple-900 border-purple-600" : "bg-blue-900 border-blue-600"}`}>
                                {product.type === "kustom" ? "Custom" : "Regular"}
                              </Badge>
                            </div>
                            <p className='text-xs text-zinc-400'>
                              {product.orderCount} orders • {product.quantity || 0} items
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium text-white'>{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-zinc-400'>
                      <Package className='w-12 h-12 mx-auto mb-2' />
                      <p>No product data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Analytics & Recent Activity */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Customer Analytics */}
            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader>
                <CardTitle className='text-white'>Customer Analytics</CardTitle>
                <CardDescription className='text-zinc-400'>Customer acquisition and retention metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='text-center p-4 bg-zinc-800 rounded-lg'>
                    <div className='text-2xl font-bold text-blue-400 mb-2'>{data?.data.customers.new || 0}</div>
                    <p className='text-sm text-zinc-300'>New Customers</p>
                    <p className='text-xs text-zinc-400 mt-1'>First-time buyers</p>
                  </div>
                  <div className='text-center p-4 bg-zinc-800 rounded-lg'>
                    <div className='text-2xl font-bold text-green-400 mb-2'>{data?.data.customers.returning || 0}</div>
                    <p className='text-sm text-zinc-300'>Returning Customers</p>
                    <p className='text-xs text-zinc-400 mt-1'>Repeat buyers</p>
                  </div>
                </div>
                <div className='mt-4 p-4 bg-zinc-800 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-purple-400 mb-2'>{formatPercentage(data?.data.customers.conversionRate || 0)}</div>
                  <p className='text-sm text-zinc-300'>Conversion Rate</p>
                  <p className='text-xs text-zinc-400 mt-1'>Average orders per customer</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className='bg-zinc-900 border-zinc-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Activity className='w-5 h-5' />
                  Recent Activity
                </CardTitle>
                <CardDescription className='text-zinc-400'>Latest orders and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data?.data?.recentActivity?.length > 0 ? (
                    data.data.recentActivity.map((activity: any) => (
                      <div key={activity.id} className='flex items-center justify-between p-3 bg-zinc-800 rounded-lg'>
                        <div>
                          <p className='text-sm font-medium text-white'>{activity.customerName}</p>
                          <p className='text-xs text-zinc-400'>{activity.productName}</p>
                          <p className='text-xs text-zinc-500'>
                            {new Date(activity.createdAt).toLocaleDateString("id-ID", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-medium text-white'>{formatCurrency(activity.amount)}</p>
                          <Badge
                            variant='outline'
                            className={`text-xs ${activity.status === "COMPLETED" ? "bg-green-900 border-green-600" : activity.status === "PROCESSING" ? "bg-blue-900 border-blue-600" : "bg-yellow-900 border-yellow-600"}`}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-zinc-400'>
                      <Activity className='w-12 h-12 mx-auto mb-2' />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Inventory Overview */}
          <Card className='bg-zinc-900 border-zinc-700'>
            <CardHeader>
              <CardTitle className='text-white'>Product Inventory Overview</CardTitle>
              <CardDescription className='text-zinc-400'>Current product catalog statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='text-center p-6 bg-zinc-800 rounded-lg'>
                  <div className='text-3xl font-bold text-blue-400 mb-2'>{data?.data.products.totalProducts || 0}</div>
                  <p className='text-sm text-zinc-300'>Regular Products</p>
                  <p className='text-xs text-zinc-400 mt-1'>Active inventory items</p>
                </div>
                <div className='text-center p-6 bg-zinc-800 rounded-lg'>
                  <div className='text-3xl font-bold text-purple-400 mb-2'>{data?.data.products.totalKustomProducts || 0}</div>
                  <p className='text-sm text-zinc-300'>Custom Products</p>
                  <p className='text-xs text-zinc-400 mt-1'>3D customizable models</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
