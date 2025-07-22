"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Eye,
  MoreHorizontal,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { useCustomers, useCustomer } from "@/src/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function CustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const { data, error, isLoading } = useCustomers(page, 10, search)
  const { data: customerDetail } = useCustomer(selectedCustomerId || "")

  const exportCustomers = () => {
    if (!data?.data.customers) return

    const csvContent = [
      ["Name", "Email", "Phone", "Total Orders", "Total Spent", "Joined Date"].join(","),
      ...data.data.customers.map((customer: any) =>
        [
          customer.name,
          customer.email,
          customer.phone,
          customer._count.orders,
          customer.totalSpent,
          new Date(customer.createdAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "customers.csv"
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Customers exported successfully")
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const openCustomerDetail = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setIsDetailDialogOpen(true)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load customers</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-zinc-400">Manage customer database and relationships</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCustomers} variant="outline" className="border-zinc-600 text-zinc-300 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">
            Customers {data?.data.pagination.total ? `(${data.data.pagination.total})` : ""}
          </CardTitle>
          <CardDescription className="text-zinc-400">Customer database and order history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-zinc-700" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32 bg-zinc-700" />
                    <Skeleton className="h-3 w-24 bg-zinc-700" />
                  </div>
                  <Skeleton className="h-6 w-20 bg-zinc-700" />
                  <Skeleton className="h-8 w-8 bg-zinc-700" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700">
                    <TableHead className="text-zinc-300">Customer</TableHead>
                    <TableHead className="text-zinc-300">Contact</TableHead>
                    <TableHead className="text-zinc-300">Orders</TableHead>
                    <TableHead className="text-zinc-300">Total Spent</TableHead>
                    <TableHead className="text-zinc-300">Joined</TableHead>
                    <TableHead className="text-zinc-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.customers.map((customer: any) => (
                    <TableRow key={customer.id} className="border-zinc-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{customer.name}</p>
                            <p className="text-sm text-zinc-400">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <MapPin className="w-3 h-3" />
                            {customer.address.length > 30
                              ? `${customer.address.substring(0, 30)}...`
                              : customer.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                          {customer._count.orders} orders
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-white">{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell className="text-zinc-300">{formatDate(customer.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-600">
                            <DropdownMenuLabel className="text-zinc-300">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-600" />
                            <DropdownMenuItem
                              onClick={() => openCustomerDetail(customer.id)}
                              className="text-zinc-300 hover:bg-zinc-700"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`mailto:${customer.email}`)}
                              className="text-zinc-300 hover:bg-zinc-700"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
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
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-zinc-400">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.data.pagination.total)} of{" "}
                    {data.data.pagination.total} customers
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="border-zinc-600 text-zinc-300 bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-zinc-300">
                      Page {page} of {data.data.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.data.pagination.pages}
                      className="border-zinc-600 text-zinc-300 bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Customer Details</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Complete customer information and order history
            </DialogDescription>
          </DialogHeader>
          {customerDetail?.data && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-zinc-400">Name</label>
                      <p className="text-white font-medium">{customerDetail.data.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Email</label>
                      <p className="text-white">{customerDetail.data.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Phone</label>
                      <p className="text-white">{customerDetail.data.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Address</label>
                      <p className="text-white text-sm leading-relaxed">{customerDetail.data.address}</p>
                    </div>
                    {customerDetail.data.notes && (
                      <div>
                        <label className="text-sm text-zinc-400">Notes</label>
                        <p className="text-white text-sm leading-relaxed">{customerDetail.data.notes}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-zinc-400">Member Since</label>
                      <p className="text-white">{formatDate(customerDetail.data.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Stats */}
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Orders</span>
                      <span className="text-white font-medium">{customerDetail.data._count.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Spent</span>
                      <span className="text-white font-medium">
                        {formatCurrency(customerDetail.data.stats.totalSpent)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-zinc-400 text-sm">Orders by Status</span>
                      {Object.entries(customerDetail.data.stats.ordersByStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between text-sm">
                          <span className="text-zinc-300 capitalize">{status.toLowerCase()}</span>
                          <span className="text-white">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <div className="lg:col-span-2">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {customerDetail.data.orders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            {order.product.photo && (
                              <img
                                src={order.product.photo || "/placeholder.svg"}
                                alt={order.product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-white">#{order.orderId}</p>
                              <p className="text-sm text-zinc-300">{order.product.name}</p>
                              <p className="text-xs text-zinc-400">
                                {order.design.totalObjects} objects • {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`${statusColors[order.status as keyof typeof statusColors]} text-white mb-2`}
                            >
                              {order.status}
                            </Badge>
                            <p className="text-white font-medium">{formatCurrency(order.totalAmount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const statusColors = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
}
