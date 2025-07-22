"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { use } from "react";

export default function BlogPostPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);

  const { data, error, isLoading } = useSWR(`/api/admin/orders/${orderId}`, fetcher);

  if (isLoading) {
    return <div className='p-6 text-muted-foreground'>Loading order details...</div>;
  }

  if (error || !data?.success) {
    return <div className='p-6 text-destructive'>Failed to load order.</div>;
  }

  const order = data.data;
  console.log(order);
  return (
    <main className='max-w-4xl mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.orderId}</CardTitle>
          <Badge variant='outline' className='capitalize'>
            {order.status}
          </Badge>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-4 text-sm text-muted-foreground'>
          <div>
            <p>
              <span className='font-medium text-foreground'>Total Amount:</span> Rp {Number(order.totalAmount).toLocaleString()}
            </p>
            <p>
              <span className='font-medium text-foreground'>Created:</span> {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <span className='font-medium text-foreground'>Updated:</span> {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p>
              <span className='font-medium text-foreground'>Customer:</span> {order.customer.name}
            </p>
            <p>
              <span className='font-medium text-foreground'>Email:</span> {order.customer.email}
            </p>
            <p>
              <span className='font-medium text-foreground'>Phone:</span> {order.customer.phone}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Product</CardTitle>
        </CardHeader>
        <CardContent className='flex gap-6 items-start'>
          <img src={order.productKustom.photo} alt={order.productKustom.name} className='w-48 h-48 object-cover rounded-md border' />
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>
              <span className='font-medium text-foreground'>Name:</span> {order.productKustom.name}
            </p>
            <p>
              <span className='font-medium text-foreground'>Price:</span> Rp {Number(order.productKustom.price).toLocaleString()}
            </p>
            <p>
              <span className='font-medium text-foreground'>Model URL:</span>{" "}
              <a href={order.productKustom.modelUrl} className='underline'>
                {order.productKustom.modelUrl}
              </a>
            </p>
            <p>
              <span className='font-medium text-foreground'>UV Map:</span>{" "}
              <a href={order.productKustom.uvuUrl} className='underline'>
                {order.productKustom.uvuUrl}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Notes & Address</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-muted-foreground'>
          <p>
            <span className='font-medium text-foreground'>Address:</span> {order.customer.address}
          </p>
          <p>
            <span className='font-medium text-foreground'>Notes:</span> {order.customer.notes}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
