"use client";

import { fetcher } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, MoreHorizontal, Search, Filter, RefreshCw, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/src/view/header";
import { useRouter } from "next/navigation";

const statusColors = {
  PENDING: "bg-yellow-600 hover:bg-yellow-700",
  PROCESSING: "bg-blue-600 hover:bg-blue-700",
  COMPLETED: "bg-green-600 hover:bg-green-700",
  CANCELLED: "bg-red-600 hover:bg-red-700",
};

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const Page = () => {
  const { user } = useUser();
  const { data: getTransaction, error, isLoading, mutate } = useSWR("/api/user/transaction", fetcher);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: getTransactionDetail } = useSWR(selectedOrder ? `/api/user/transaction/${selectedOrder}` : null, fetcher);
  const router = useRouter();

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    if (!getTransaction?.data) return [];

    return getTransaction.data.filter((transaction: any) => {
      const matchesSearch = transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || transaction.productKustom.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [getTransaction?.data, searchQuery, statusFilter]);

  const openDetailOrder = (id: string) => {
    setSelectedOrder(id);
    setIsOpenDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-zinc-950 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-white">Transactions</h1>
              <p className="text-zinc-400 mt-2">Manage your order history and track status</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => mutate()} variant="outline" className="border-zinc-600 text-zinc-300 bg-transparent hover:bg-zinc-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-zinc-900 border border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <Input placeholder="Search by Order ID or Product name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400" />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-zinc-400">
                {filteredTransactions.length > 0 && (
                  <span>
                    Showing {filteredTransactions.length} of {getTransaction?.data?.length || 0} transactions
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Transaction History for {user?.fullName}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-400 border border-red-500 bg-red-900/20 p-4 rounded-md">
                  <p className="font-medium">Error loading transactions</p>
                  <p className="text-sm mt-1">{error.message || "Unknown Error"}</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-700">
                        <TableHead className="w-10 text-zinc-400">#</TableHead>
                        <TableHead className="text-zinc-400">Order ID</TableHead>
                        <TableHead className="text-zinc-400">Product</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400">Total Amount</TableHead>
                        <TableHead className="text-zinc-400">Created At</TableHead>
                        <TableHead className="w-10 text-zinc-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction: any, index: number) => (
                        <TableRow key={transaction.id} className="hover:bg-zinc-800/50 transition border-zinc-700">
                          <TableCell className="font-medium text-white">{index + 1}</TableCell>
                          <TableCell className="text-zinc-300 font-mono text-sm">{transaction.orderId}</TableCell>
                          <TableCell className="text-zinc-300">
                            <div className="flex items-center gap-3">
                              <img
                                src={transaction.productKustom?.photo || transaction.product?.images?.[0] || "/placeholder.svg"}
                                alt={transaction.productKustom?.name || transaction.product?.name || "Product"}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="capitalize">{transaction.productKustom?.name || transaction.product?.name || "-"}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={`${statusColors[transaction.status as keyof typeof statusColors]} text-white`}>{transaction.status}</Badge>
                          </TableCell>
                          <TableCell className="text-zinc-300 font-medium">{formatCurrency(Number(transaction.totalAmount))}</TableCell>
                          <TableCell className="text-zinc-300 text-sm">{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                                <DropdownMenuLabel className="text-zinc-300">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-600" />
                                <DropdownMenuItem onClick={() => openDetailOrder(transaction.orderId)} className="text-zinc-300 hover:bg-zinc-700 cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/orders/${transaction.orderId}`)} className="text-zinc-300 hover:bg-zinc-700 cursor-pointer">
                                  <Mail className="mr-2 h-4 w-4" />
                                  Go to Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-zinc-400 text-lg mb-2">{searchQuery || statusFilter !== "all" ? "No transactions match your filters" : "No transactions found"}</div>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 bg-transparent hover:bg-zinc-800"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Transaction Details</DialogTitle>
            <DialogDescription className="text-zinc-400">Complete order information and customer details</DialogDescription>
          </DialogHeader>

          {getTransactionDetail?.data ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400">Order ID</label>
                    <p className="text-white font-mono">{getTransactionDetail.data.orderId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Status</label>
                    <div className="mt-1">
                      <Badge className={`${statusColors[getTransactionDetail.data.status as keyof typeof statusColors]} text-white`}>{getTransactionDetail.data.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Total Amount</label>
                    <p className="text-white font-medium text-lg">{formatCurrency(Number(getTransactionDetail.data.totalAmount))}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Order Date</label>
                    <p className="text-white">{formatDate(getTransactionDetail.data.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Last Updated</label>
                    <p className="text-white">{formatDate(getTransactionDetail.data.updatedAt)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400">Name</label>
                    <p className="text-white font-medium">{getTransactionDetail.data.customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Email</label>
                    <p className="text-white">{getTransactionDetail.data.customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Phone</label>
                    <p className="text-white">{getTransactionDetail.data.customer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Address</label>
                    <p className="text-white text-sm leading-relaxed">{getTransactionDetail.data.customer.address}</p>
                  </div>
                  {getTransactionDetail.data.customer.notes && (
                    <div>
                      <label className="text-sm text-zinc-400">Notes</label>
                      <p className="text-white text-sm leading-relaxed">{getTransactionDetail.data.customer.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card className="bg-zinc-800 border-zinc-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-zinc-700 rounded-lg">
                    {getTransactionDetail.data.productKustom?.photo && (
                      <img src={getTransactionDetail.data.productKustom?.photo || "/placeholder.svg"} alt={getTransactionDetail.data.productKustom?.name} className="w-16 h-16 rounded object-cover" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg">{getTransactionDetail.data.productKustom?.name}</h3>
                      <p className="text-zinc-400 text-sm">Model ID: {getTransactionDetail.data.productKustom?.modelId}</p>
                      <p className="text-white font-medium mt-1">{formatCurrency(Number(getTransactionDetail.data.productKustom?.price))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-zinc-400">Loading transaction details...</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Page;
