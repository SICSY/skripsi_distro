"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, User, Phone, MapPin, Clock, CheckCircle, AlertCircle, Loader2, Download, Eye, Palette, Truck, PackageCheck, XCircle, ShoppingCart, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface OrderData {
  id: string;
  orderId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  totalAmount: string;
  quantity?: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
  productKustom?: {
    id: string;
    name: string;
    modelUrl: string;
    photo: string;
    uvUrl?: string;
    price: number;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    category?: string;
    size: string;
    stock: number;
  };
  design?: {
    id: string;
    fabricData: any;
    designImage: string;
    backgroundColor: string;
    decalColor: string;
    totalObjects: number;
    hasUVGuide: boolean;
    canvasWidth: number;
    canvasHeight: number;
    designObjects: Array<{
      id: string;
      type: string;
      name: string;
      left?: number;
      top?: number;
      width?: number;
      height?: number;
      radius?: number;
      fill?: string;
      fontSize?: number;
      text?: string;
      fontFamily?: string;
      opacity?: number;
    }>;
  };
}

const statusConfig = {
  PENDING: {
    label: "Pending Review",
    color: "bg-yellow-500",
    icon: Clock,
    description: "Your order is being reviewed by our team"
  },
  PROCESSING: {
    label: "In Production",
    color: "bg-blue-500",
    icon: Package,
    description: "Your order is being processed"
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-500",
    icon: PackageCheck,
    description: "Your order has been completed and shipped"
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-500",
    icon: XCircle,
    description: "This order has been cancelled"
  }
};

const timelineSteps = [
  { key: "PENDING", label: "Order Placed", icon: CheckCircle },
  { key: "PROCESSING", label: "In Production", icon: Package },
  { key: "COMPLETED", label: "Completed", icon: Truck }
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/orders/${orderId}`, { method: "GET" });
        const result = await response.json();

        if (result.success) {
          setOrderData(result.data);
        } else {
          setError(result.message || "Order not found");
          toast.error(result.message || "Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order data");
        toast.error("Failed to load order data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleDownloadDesign = () => {
    if (!orderData?.design?.designImage) {
      toast.error("Design image not available");
      return;
    }

    const link = document.createElement("a");
    link.href = orderData.design.designImage;
    link.download = `design-${orderData.orderId}.png`;
    link.click();
    toast.success("Design downloaded successfully");
  };

  const getStatusStep = (status: string) => {
    const statusOrder = ["PENDING", "PROCESSING", "COMPLETED"];
    return statusOrder.indexOf(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: string | number) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  };

  const isCustomOrder = orderData?.productKustom != null;
  const isRegularOrder = orderData?.product != null;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-white' />
          <p className='text-white'>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-16 h-16 mx-auto mb-4 text-red-400' />
          <h1 className='text-2xl font-bold text-white mb-2'>Order Not Found</h1>
          <p className='text-zinc-400 mb-6'>{error || "The order you're looking for doesn't exist."}</p>
          <Button onClick={() => router.back()} className='bg-blue-600 hover:bg-blue-700'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[orderData.status];
  const currentStep = getStatusStep(orderData.status);

  return (
    <div className='min-h-screen bg-zinc-950 p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <Button variant='ghost' onClick={() => router.back()} className='text-zinc-400 hover:text-white mb-4'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-white'>Order Details</h1>
              <p className='text-zinc-400'>Order ID: {orderData.orderId}</p>
            </div>
            <div className='flex items-center gap-3'>
              {isCustomOrder && (
                <Badge className='bg-purple-600 text-white'>
                  <Palette className='w-4 h-4 mr-1' />
                  Custom Order
                </Badge>
              )}
              {isRegularOrder && (
                <Badge className='bg-blue-600 text-white'>
                  <ShoppingCart className='w-4 h-4 mr-1' />
                  Regular Order
                </Badge>
              )}
              <Badge className={`${currentStatus.color} text-white px-4 py-2 text-sm`}>
                <currentStatus.icon className='w-4 h-4 mr-2' />
                {currentStatus.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className='grid lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Order Status Timeline */}
            <Card className='bg-zinc-900 text-white border-zinc-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='w-5 h-5' />
                  Order Status
                </CardTitle>
                <CardDescription className='text-zinc-400'>{currentStatus.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    const isDisabled = orderData.status === "CANCELLED" && index > 0;

                    return (
                      <div key={step.key} className='flex items-center gap-4'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDisabled ? "bg-zinc-700 text-zinc-500" : isCompleted ? "bg-green-600 text-white" : isCurrent ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          <step.icon className='w-5 h-5' />
                        </div>
                        <div className='flex-1'>
                          <h4 className={`font-medium ${isDisabled ? "text-zinc-500" : isCompleted || isCurrent ? "text-white" : "text-zinc-400"}`}>{step.label}</h4>
                          {isCurrent && <p className='text-sm text-zinc-400'>{orderData.status === "CANCELLED" ? "Order was cancelled" : "Current status"}</p>}
                        </div>
                        {isCompleted && orderData.status !== "CANCELLED" && <CheckCircle className='w-5 h-5 text-green-400' />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Custom Design Preview - Only for Custom Orders */}
            {isCustomOrder && orderData.design && (
              <Card className='bg-zinc-900 text-white border-zinc-700'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Palette className='w-5 h-5' />
                    Design Preview
                  </CardTitle>
                  <CardDescription className='text-zinc-400'>Your custom design details</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    {/* Design Image */}
                    <div className='space-y-3'>
                      <h4 className='font-medium'>Design Image</h4>
                      <div className='aspect-square bg-zinc-800 rounded-lg overflow-hidden'>
                        {orderData.design.designImage ? (
                          <img src={orderData.design.designImage || "/placeholder.svg"} alt='Design Preview' className='w-full h-full object-contain' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-zinc-400'>
                            <Eye className='w-12 h-12' />
                          </div>
                        )}
                      </div>
                      <Button onClick={handleDownloadDesign} className='w-full bg-blue-600 hover:bg-blue-700'>
                        <Download className='w-4 h-4 mr-2' />
                        Download Design
                      </Button>
                    </div>

                    {/* Design Details */}
                    <div className='space-y-3'>
                      <h4 className='font-medium'>Design Details</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-zinc-400'>Total Objects:</span>
                          <span>{orderData.design.totalObjects}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-zinc-400'>Canvas Size:</span>
                          <span>
                            {orderData.design.canvasWidth} × {orderData.design.canvasHeight}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-zinc-400'>Background Color:</span>
                          <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 rounded border border-zinc-600' style={{ backgroundColor: orderData.design.backgroundColor }} />
                            <span className='text-xs'>{orderData.design.backgroundColor}</span>
                          </div>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-zinc-400'>Decal Color:</span>
                          <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 rounded border border-zinc-600' style={{ backgroundColor: orderData.design.decalColor }} />
                            <span className='text-xs'>{orderData.design.decalColor}</span>
                          </div>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-zinc-400'>UV Guide:</span>
                          <span>{orderData.design.hasUVGuide ? "Yes" : "No"}</span>
                        </div>
                      </div>

                      {/* Design Objects */}
                      {orderData.design.designObjects.length > 0 && (
                        <div className='mt-4'>
                          <h5 className='font-medium mb-2'>Design Objects</h5>
                          <div className='space-y-1 max-h-32 overflow-y-auto'>
                            {orderData.design.designObjects.map((obj, index) => (
                              <div key={obj.id} className='flex justify-between text-xs bg-zinc-800 p-2 rounded'>
                                <span>{obj.name}</span>
                                <span className='text-zinc-400 capitalize'>{obj.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Details */}
            <Card className='bg-zinc-900 text-white border-zinc-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='w-5 h-5' />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCustomOrder && orderData.productKustom && (
                  <div className='flex gap-4'>
                    {orderData.productKustom.photo && <Image src={orderData.productKustom.photo || "/placeholder.svg"} alt={orderData.productKustom.name} width={100} height={100} className='rounded-lg object-cover' />}
                    <div className='flex-1'>
                      <h4 className='font-medium text-lg'>{orderData.productKustom.name}</h4>
                      <p className='text-zinc-400 text-sm'>Custom 3D Model</p>
                      {orderData.productKustom.uvUrl && <p className='text-xs text-green-400 mt-1'>UV Mapping Available</p>}
                      <div className='mt-2 text-sm space-y-1'>
                        <p className='text-zinc-400'>Base Price: {formatCurrency(orderData.productKustom.price)}</p>
                        <p className='text-zinc-400'>Model URL: {orderData.productKustom.modelUrl}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isRegularOrder && orderData.product && (
                  <div className='flex gap-4'>
                    <div className='flex-shrink-0'>
                      {orderData.product.images && orderData.product.images.length > 0 ? (
                        <div className='relative'>
                          <Image src={orderData.product.images[0] || "/placeholder.svg"} alt={orderData.product.name} width={100} height={100} className='rounded-lg object-cover' />
                          {orderData.product.images.length > 1 && <Badge className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs'>+{orderData.product.images.length - 1}</Badge>}
                        </div>
                      ) : (
                        <div className='w-[100px] h-[100px] bg-zinc-800 rounded-lg flex items-center justify-center'>
                          <ImageIcon className='w-8 h-8 text-zinc-400' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-lg'>{orderData.product.name}</h4>
                      <p className='text-zinc-400 text-sm'>{orderData.product.description || "Regular Product"}</p>
                      <div className='flex items-center gap-2 mt-2'>
                        {orderData.product.category && (
                          <Badge variant='outline' className='text-xs bg-zinc-800 border-zinc-600'>
                            {orderData.product.category}
                          </Badge>
                        )}
                        <Badge variant='outline' className='text-xs bg-zinc-800 border-zinc-600'>
                          Size: {orderData.product.size}
                        </Badge>
                      </div>
                      <div className='mt-2 text-sm space-y-1'>
                        <p className='text-zinc-400'>Unit Price: {formatCurrency(orderData.product.price)}</p>
                        {orderData.quantity && <p className='text-zinc-400'>Quantity: {orderData.quantity} items</p>}
                        <p className='text-zinc-400'>Available Stock: {orderData.product.stock}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Images Gallery - Only for Regular Products with multiple images */}
            {isRegularOrder && orderData.product?.images && orderData.product.images.length > 1 && (
              <Card className='bg-zinc-900 text-white border-zinc-700'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <ImageIcon className='w-5 h-5' />
                    Product Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {orderData.product.images.map((image, index) => (
                      <div key={index} className='aspect-square bg-zinc-800 rounded-lg overflow-hidden'>
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${orderData.product?.name} ${index + 1}`}
                          width={200}
                          height={200}
                          className='w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer'
                          onClick={() => window.open(image, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Order Summary */}
            <Card className='bg-zinc-900 text-white border-zinc-700'>
              <CardHeader>
                <CardTitle className='text-lg'>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Order ID:</span>
                    <span className='font-mono text-xs'>{orderData.orderId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Type:</span>
                    <span className='capitalize'>{isCustomOrder ? "Custom Order" : "Regular Order"}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Status:</span>
                    <span className='capitalize'>{orderData.status.toLowerCase()}</span>
                  </div>
                  {orderData.quantity && (
                    <div className='flex justify-between'>
                      <span className='text-zinc-400'>Quantity:</span>
                      <span>{orderData.quantity} items</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Total Amount:</span>
                    <span className='font-semibold'>{formatCurrency(orderData.totalAmount)}</span>
                  </div>
                  <Separator className='bg-zinc-700' />
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Order Date:</span>
                    <span className='text-xs'>{formatDate(orderData.createdAt)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Last Updated:</span>
                    <span className='text-xs'>{formatDate(orderData.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className='bg-zinc-900 text-white border-zinc-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <User className='w-5 h-5' />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2 text-sm'>
                  <div>
                    <div className='flex items-center gap-2 text-zinc-400 mb-1'>
                      <User className='w-4 h-4' />
                      <span>Name</span>
                    </div>
                    <p>{orderData.customer.name}</p>
                  </div>
                  <div>
                    <div className='flex items-center gap-2 text-zinc-400 mb-1'>
                      <span>Email</span>
                    </div>
                    <p className='text-xs'>{orderData.customer.email}</p>
                  </div>
                  <div>
                    <div className='flex items-center gap-2 text-zinc-400 mb-1'>
                      <Phone className='w-4 h-4' />
                      <span>Phone</span>
                    </div>
                    <p>{orderData.customer.phone}</p>
                  </div>
                  <div>
                    <div className='flex items-center gap-2 text-zinc-400 mb-1'>
                      <MapPin className='w-4 h-4' />
                      <span>Address</span>
                    </div>
                    <p className='text-xs leading-relaxed'>{orderData.customer.address}</p>
                  </div>
                  {orderData.customer.notes && (
                    <div>
                      <div className='flex items-center gap-2 text-zinc-400 mb-1'>
                        <span>Notes</span>
                      </div>
                      <p className='text-xs leading-relaxed bg-zinc-800 p-2 rounded'>{orderData.customer.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className='bg-zinc-900 text-white border-zinc-700'>
              <CardHeader>
                <CardTitle className='text-lg'>Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button onClick={() => router.push("/products")} className='w-full bg-blue-600 hover:bg-blue-700'>
                  Browse Products
                </Button>
                <Button variant='outline' onClick={() => window.print()} className='w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800'>
                  Print Order Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
