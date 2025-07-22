"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Download, Eye, Edit, Trash2, MoreHorizontal, Plus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useOrders, updateOrderStatus } from "@/src/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { mutate } from "swr";
import Link from "next/link";

const statusColors = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500"
};

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, error, isLoading } = useOrders(page, 10, status === "all" ? undefined : status, search);

  console.log(data);
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.orderId, newStatus);
      mutate(`/api/admin/orders?page=${page}&limit=10${status !== "all" ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`);
      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportOrders = () => {
    if (!data?.data.orders) return;

    const csvContent = [
      ["Order ID", "Customer", "Product", "Status", "Amount", "Date"].join(","),
      ...data.data.orders.map((order: any) => [order.orderId, order.customer.name, order.productKustom?.name, order.status, order.totalAmount, new Date(order.createdAt).toLocaleDateString()].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Orders exported successfully");
  };

  const formatCurrency = (amount: string) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-400'>Failed to load orders</p>
        <Button onClick={() => window.location.reload()} className='mt-4'>
          <RefreshCw className='w-4 h-4 mr-2' />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Orders</h1>
          <p className='text-zinc-400'>Manage customer orders and track status</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={exportOrders} variant='outline' className='border-zinc-600 text-zinc-300 bg-transparent'>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className='bg-zinc-900 border-zinc-700'>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4' />
                <Input placeholder='Search orders, customers, or products...' value={search} onChange={(e) => setSearch(e.target.value)} className='pl-10 bg-zinc-800 border-zinc-600 text-white' />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className='w-48 bg-zinc-800 border-zinc-600 text-white'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent className='bg-zinc-800 border-zinc-600'>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className='text-white'>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className='bg-zinc-900 border-zinc-700'>
        <CardHeader>
          <CardTitle className='text-white'>Orders {data?.data?.pagination.total ? `(${data.data.pagination.total})` : ""}</CardTitle>
          <CardDescription className='text-zinc-400'>Recent customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='flex items-center space-x-4'>
                  <Skeleton className='h-12 w-12 rounded bg-zinc-700' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-32 bg-zinc-700' />
                    <Skeleton className='h-3 w-24 bg-zinc-700' />
                  </div>
                  <Skeleton className='h-6 w-20 bg-zinc-700' />
                  <Skeleton className='h-8 w-8 bg-zinc-700' />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='border-zinc-700'>
                    <TableHead className='text-zinc-300'>Order ID</TableHead>
                    <TableHead className='text-zinc-300'>Customer</TableHead>
                    <TableHead className='text-zinc-300'>Product</TableHead>
                    <TableHead className='text-zinc-300'>Status</TableHead>
                    <TableHead className='text-zinc-300'>Amount</TableHead>
                    <TableHead className='text-zinc-300'>Date</TableHead>
                    <TableHead className='text-zinc-300'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.orders.map((order: any) => (
                    <TableRow key={order.id} className='border-zinc-700'>
                      <TableCell className='font-mono text-sm text-white'>#{order.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium text-white'>{order.customer.name}</p>
                          <p className='text-sm text-zinc-400'>{order.customer.email}</p>
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <div className='flex items-center gap-3'>
                          {order.productKustom?.photo && <img src={order.productKustom?.photo || "/placeholder.svg"} alt={order.productKustom?.name} className='w-8 h-8 rounded object-cover' />}
                          <span className='text-white'>{order.productKustom?.name}</span>
                        </div>
                      </TableCell> */}
                      <TableCell className='text-zinc-300'>
                        <div className='flex items-center gap-3'>
                          <img src={order.productKustom?.photo || order.product?.images?.[0] || "/placeholder.svg"} alt={order.productKustom?.name || order.product?.name || "Product"} className='w-8 h-8 rounded object-cover' />
                          <span className='capitalize'>{order.productKustom?.name || order.product?.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className='font-medium text-white'>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell className='text-zinc-300'>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='bg-zinc-800 border-zinc-600'>
                            <DropdownMenuLabel className='text-zinc-300'>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className='bg-zinc-600' />
                            <Link href={`/admin/orders/${order.orderId}`}>
                              <DropdownMenuItem className='text-zinc-300 hover:bg-zinc-700'>
                                <Eye className='mr-2 h-4 w-4' />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status);
                                setIsStatusDialogOpen(true);
                              }}
                              className='text-zinc-300 hover:bg-zinc-700'
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data?.data.pagination && (
                <div className='flex items-center justify-between mt-6'>
                  <p className='text-sm text-zinc-400'>
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.data.pagination.total)} of {data.data.pagination.total} orders
                  </p>
                  <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={() => setPage(page - 1)} disabled={page === 1} className='border-zinc-600 text-zinc-300 bg-transparent'>
                      <ChevronLeft className='w-4 h-4' />
                    </Button>
                    <span className='text-sm text-zinc-300'>
                      Page {page} of {data.data.pagination.pages}
                    </span>
                    <Button variant='outline' size='sm' onClick={() => setPage(page + 1)} disabled={page === data.data.pagination.pages} className='border-zinc-600 text-zinc-300 bg-transparent'>
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-700'>
          <DialogHeader>
            <DialogTitle className='text-white'>Update Order Status</DialogTitle>
            <DialogDescription className='text-zinc-400'>Change the status of order #{selectedOrder?.orderId}</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-zinc-300'>New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className='mt-1 bg-zinc-800 border-zinc-600 text-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-zinc-800 border-zinc-600'>
                  {statusOptions.slice(1).map((option) => (
                    <SelectItem key={option.value} value={option.value} className='text-white'>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsStatusDialogOpen(false)} className='border-zinc-600 text-zinc-300 bg-transparent'>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating} className='bg-blue-600 hover:bg-blue-700'>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
