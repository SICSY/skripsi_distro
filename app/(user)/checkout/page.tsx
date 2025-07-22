// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { ShoppingCart, User, Phone, MapPin, Package, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import Image from "next/image";

// interface CheckoutData {
//   customer: {
//     name: string;
//     email: string;
//     phone: string;
//     address: string;
//     notes: string;
//     userId: string;
//   };
//   productKustom: {
//     modelId: string;
//     modelName: string;
//     modelUrl: string;
//     modelPhoto: string;
//     uvUrl?: string;
//   };
//   design: {
//     fabricData: any;
//     designImage: string;
//     backgroundColor: string;
//     decalColor: string;
//     objects: any[];
//   };
//   metadata: {
//     orderId: string;
//     totalObjects: number;
//     hasUVGuide: boolean;
//     canvasSize: {
//       width: number;
//       height: number;
//     };
//   };
// }

// export default function CheckoutPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
//   const [customerInfo, setCustomerInfo] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//     notes: ""
//   });
//   const [getStorage, setStorage] = useState<boolean>(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [orderSuccess, setOrderSuccess] = useState(false);
//   const [orderResult, setOrderResult] = useState<any>(null);

//   console.log(checkoutData);
//   //  Load checkout data from multiple sources
//   useEffect(() => {
//     const loadCheckoutData = async () => {
//       try {
//         const sessionData = sessionStorage.getItem("checkoutData");
//         if (sessionData) {
//           const parsedData = JSON.parse(sessionData);
//           console.log("parsed", parsedData);
//           setCheckoutData(parsedData);

//           return;
//         } else {
//           setStorage(true);
//         }
//       } catch (error) {
//         console.error("Error parsing session checkout data:", error);
//       }

//       // Method 4: Try localStorage (fallback)
//       try {
//         const localData = localStorage.getItem("checkoutData");
//         if (localData) {
//           const parsedData = JSON.parse(localData);
//           setCheckoutData(parsedData);

//           return;
//         } else {
//           setStorage(true);
//         }
//       } catch (error) {
//         console.error("Error parsing local checkout data:", error);
//       }

//       // If no data found, redirect to home
//       toast.error("No checkout data found. Please create a design first.");
//       // router.push("/");
//     };

//     loadCheckoutData();
//   }, [searchParams, router]);

//   const handleCustomerInfoChange = useCallback((field: string, value: string) => {
//     setCustomerInfo((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const handleSubmitOrder = useCallback(async () => {
//     if (!checkoutData) {
//       toast.error("No checkout data available");
//       return;
//     }

//     if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const orderData = {
//         customer: {
//           userId: checkoutData.customer.userId,
//           ...customerInfo
//         },
//         productKustom: checkoutData.productKustom,
//         design: checkoutData.design,
//         metadata: checkoutData.metadata
//       };

//       console.log(orderData);
//       const response = await fetch("/api/user/checkout", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(orderData)
//       });
//       const result = await response.json();
//       if (result.success) {
//         setOrderResult(result.data);
//         setOrderSuccess(true);
//         toast.success("Order submitted successfully!");

//         // Clear checkout data from all sources
//         localStorage.removeItem("checkoutData");
//         sessionStorage.removeItem("checkoutData");
//       } else {
//         toast.error(result.message + result.errors?.[0]?.message || "Failed to submit order");
//         // if (result.errors) {
//         //   console.log(result.errors);
//         //   console.error("Validation errors:", result.errors?.[0]?.message);
//         // }
//       }
//     } catch (error) {
//       console.error("Submit order error:", error);
//       toast.error("Failed to submit order. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [checkoutData, customerInfo]);

//   const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone && customerInfo.address;
//   if (getStorage) {
//     return (
//       <div className='min-h-screen flex items-center justify-center bg-zinc-950'>
//         <div className='text-center'>
//           <p className='text-white'>Keranjang Anda Kosong</p>
//         </div>
//       </div>
//     );
//   }
//   if (!checkoutData) {
//     return (
//       <div className='min-h-screen flex items-center justify-center bg-zinc-950'>
//         <div className='text-center'>
//           <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-white' />
//           <p className='text-white'>Loading checkout data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (orderSuccess && orderResult) {
//     console.log(orderResult);
//     return (
//       <div className='min-h-screen bg-zinc-950 p-4 items-center justify-center flex'>
//         <div className='max-w-2xl mx-auto'>
//           <Card className='bg-zinc-900 text-white border-zinc-700'>
//             <CardHeader className='text-center'>
//               <div className='mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4'>
//                 <CheckCircle className='w-8 h-8 text-white' />
//               </div>
//               <CardTitle className='text-2xl text-green-400'>Order Submitted Successfully!</CardTitle>
//               <CardDescription className='text-zinc-400'>Your custom design order has been received and is being processed.</CardDescription>
//             </CardHeader>
//             <CardContent className='space-y-6'>
//               <div className='bg-zinc-800 p-4 rounded-lg'>
//                 <h3 className='font-semibold mb-3'>Order Details</h3>
//                 <div className='space-y-2 text-sm'>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Order ID:</span>
//                     <span className='font-mono'>{orderResult.orderId}</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Status:</span>
//                     <span className='text-yellow-400 capitalize'>{orderResult.status}</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Total Amount:</span>
//                     <span className='font-semibold'>Rp {Number(orderResult.totalAmount).toLocaleString("id-ID")}</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Customer:</span>
//                     <span>{orderResult.customer.name}</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Product:</span>
//                     <span>{orderResult.productKustom.name}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className='bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg'>
//                 <div className='flex items-start gap-3'>
//                   <AlertCircle className='w-5 h-5 text-blue-400 mt-0.5' />
//                   <div>
//                     <h4 className='font-medium text-blue-400'>What's Next?</h4>
//                     <p className='text-sm text-zinc-300 mt-1'>We'll review your design and contact you within 24 hours with production details and payment instructions.</p>
//                   </div>
//                 </div>
//               </div>

//               <div className='flex gap-3'>
//                 <Button onClick={() => router.push("/")} className='flex-1 bg-blue-600 hover:bg-blue-700'>
//                   Create New Design
//                 </Button>
//                 <Button variant='outline' onClick={() => router.push(`/orders/${orderResult.orderId}`)} className='border-zinc-600 text-zinc-300 hover:bg-zinc-800'>
//                   Track Order
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='min-h-screen bg-zinc-950 p-4'>
//       <div className='max-w-4xl mx-auto'>
//         {/* Header */}
//         <div className='mb-6'>
//           <Button variant='ghost' onClick={() => router.back()} className='text-zinc-400 hover:text-white mb-4'>
//             <ArrowLeft className='w-4 h-4 mr-2' />
//             Back to Designer
//           </Button>
//           <h1 className='text-3xl font-bold text-white'>Checkout</h1>
//           <p className='text-zinc-400'>Complete your custom design order</p>
//         </div>

//         <div className='grid lg:grid-cols-2 gap-6'>
//           {/* Customer Information Form */}
//           <Card className='bg-zinc-900 text-white border-zinc-700'>
//             <CardHeader>
//               <CardTitle className='flex items-center gap-2'>
//                 <User className='w-5 h-5' />
//                 Customer Information
//               </CardTitle>
//               <CardDescription className='text-zinc-400'>Please provide your details for order processing</CardDescription>
//             </CardHeader>
//             <CardContent className='space-y-4'>
//               {/* Customer Name */}
//               <div className='space-y-2'>
//                 <Label htmlFor='name' className='flex items-center gap-2'>
//                   <User className='w-4 h-4' />
//                   Full Name *
//                 </Label>
//                 <Input id='name' value={customerInfo.name} onChange={(e) => handleCustomerInfoChange("name", e.target.value)} placeholder='Enter your full name' className='bg-zinc-800 border-zinc-600 text-white' required />
//               </div>

//               {/* Email */}
//               <div className='space-y-2'>
//                 <Label htmlFor='email'>Email Address *</Label>
//                 <Input id='email' type='email' value={customerInfo.email} onChange={(e) => handleCustomerInfoChange("email", e.target.value)} placeholder='Enter your email' className='bg-zinc-800 border-zinc-600 text-white' required />
//               </div>

//               {/* Phone */}
//               <div className='space-y-2'>
//                 <Label htmlFor='phone' className='flex items-center gap-2'>
//                   <Phone className='w-4 h-4' />
//                   Phone Number *
//                 </Label>
//                 <Input
//                   id='phone'
//                   type='number'
//                   value={customerInfo.phone}
//                   onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
//                   placeholder='Enter your phone number'
//                   className='bg-zinc-800 border-zinc-600 text-white'
//                   required
//                 />
//               </div>

//               {/* Address */}
//               <div className='space-y-2'>
//                 <Label htmlFor='address' className='flex items-center gap-2'>
//                   <MapPin className='w-4 h-4' />
//                   Delivery Address *
//                 </Label>
//                 <Textarea
//                   id='address'
//                   value={customerInfo.address}
//                   onChange={(e) => handleCustomerInfoChange("address", e.target.value)}
//                   placeholder='Enter your complete delivery address'
//                   className='bg-zinc-800 border-zinc-600 text-white min-h-[80px]'
//                   required
//                 />
//               </div>

//               {/* Notes */}
//               <div className='space-y-2'>
//                 <Label htmlFor='notes'>Additional Notes (Optional)</Label>
//                 <Textarea
//                   id='notes'
//                   value={customerInfo.notes}
//                   onChange={(e) => handleCustomerInfoChange("notes", e.target.value)}
//                   placeholder='Any special instructions or notes'
//                   className='bg-zinc-800 border-zinc-600 text-white min-h-[60px]'
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Order Summary */}
//           <Card className='bg-zinc-900 text-white border-zinc-700'>
//             <CardHeader>
//               <CardTitle className='flex items-center gap-2'>
//                 <Package className='w-5 h-5' />
//                 Order Summary
//               </CardTitle>
//             </CardHeader>
//             <CardContent className='space-y-4'>
//               {/* Product Info */}
//               <div className='bg-zinc-800 p-4 rounded-lg'>
//                 <h4 className='font-medium mb-3'>Product Details</h4>
//                 <div className='flex gap-3'>
//                   {checkoutData.productKustom.modelPhoto && <Image src={checkoutData.productKustom.modelPhoto || "/placeholder.svg"} alt={checkoutData.productKustom.modelName} width={80} height={80} className='rounded-lg object-cover' />}
//                   <div className='flex-1'>
//                     <h5 className='font-medium'>{checkoutData.productKustom.modelName}</h5>
//                     <p className='text-sm text-zinc-400'>Custom 3D Model</p>
//                     {checkoutData.productKustom.uvUrl && <p className='text-xs text-green-400'>UV Mapping Available</p>}
//                   </div>
//                 </div>
//               </div>

//               {/* Design Preview */}
//               <div className='bg-zinc-800 p-4 rounded-lg'>
//                 <h4 className='font-medium mb-3'>Design Preview</h4>
//                 <div className='aspect-square bg-zinc-700 rounded-lg overflow-hidden mb-3'>
//                   {checkoutData.design.designImage ? (
//                     <img src={checkoutData.design.designImage || "/placeholder.svg"} alt='Design Preview' className='w-full h-full object-contain' />
//                   ) : (
//                     <div className='w-full h-full flex items-center justify-center text-zinc-400'>
//                       <Package className='w-12 h-12' />
//                     </div>
//                   )}
//                 </div>
//                 <div className='text-sm space-y-1'>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Design Objects:</span>
//                     <span>{checkoutData.metadata.totalObjects}</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Background Color:</span>
//                     <div className='flex items-center gap-2'>
//                       <div className='w-4 h-4 rounded border border-zinc-600' style={{ backgroundColor: checkoutData.design.backgroundColor }} />
//                       <span className='text-xs'>{checkoutData.design.backgroundColor}</span>
//                     </div>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Canvas Size:</span>
//                     <span>
//                       {checkoutData.metadata.canvasSize.width} × {checkoutData.metadata.canvasSize.height}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Pricing */}
//               <div className='bg-zinc-800 p-4 rounded-lg'>
//                 <h4 className='font-medium mb-3'>Pricing</h4>
//                 <div className='space-y-2 text-sm'>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Base Price:</span>
//                     <span>Rp 100.000</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span className='text-zinc-400'>Custom Design:</span>
//                     <span>Included</span>
//                   </div>
//                   <Separator className='bg-zinc-600' />
//                   <div className='flex justify-between font-semibold text-lg'>
//                     <span>Total:</span>
//                     <span>Rp 100.000</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <Button onClick={handleSubmitOrder} disabled={!isFormValid || isSubmitting} className='w-full bg-blue-600 hover:bg-blue-700 h-12'>
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className='w-4 h-4 mr-2 animate-spin' />
//                     Processing Order...
//                   </>
//                 ) : (
//                   <>
//                     <ShoppingCart className='w-4 h-4 mr-2' />
//                     Submit Order - Rp 100.000
//                   </>
//                 )}
//               </Button>

//               <p className='text-xs text-zinc-400 text-center'>By submitting this order, you agree to our terms and conditions.</p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, User, Phone, MapPin, Package, Loader2, ArrowLeft, CheckCircle, Palette, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface CheckoutDataKustom {
  type: "kustom";
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    userId: string;
  };
  productKustom: {
    modelId: string;
    modelName: string;
    modelUrl: string;
    modelPhoto: string;
    uvUrl?: string;
  };
  design: {
    fabricData: any;
    designImage: string;
    backgroundColor: string;
    decalColor: string;
    objects: any[];
  };
  metadata: {
    orderId: string;
    totalObjects: number;
    hasUVGuide: boolean;
    canvasSize: {
      width: number;
      height: number;
    };
  };
}

interface CheckoutDataRegular {
  type: "regular";
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    category?: string;
    size?: string;
    stock: number;
  };
  quantity: number;
  timestamp: number;
}

type CheckoutData = CheckoutDataKustom | CheckoutDataRegular;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [quantity, setQuantity] = useState(1);
  const [getStorage, setStorage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Load checkout data
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const sessionData = sessionStorage.getItem("checkoutData");
        if (sessionData) {
          const parsedData = JSON.parse(sessionData);
          setCheckoutData(parsedData);
          if (parsedData.type === "regular") {
            setQuantity(parsedData.quantity || 1);
          }
          return;
        }

        const localData = localStorage.getItem("checkoutData");
        if (localData) {
          const parsedData = JSON.parse(localData);
          setCheckoutData(parsedData);
          if (parsedData.type === "regular") {
            setQuantity(parsedData.quantity || 1);
          }
          return;
        }

        setStorage(true);
      } catch (error) {
        console.error("Error parsing checkout data:", error);
        setStorage(true);
      }
    };

    loadCheckoutData();
  }, [searchParams, router]);

  const handleCustomerInfoChange = useCallback((field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleQuantityChange = (newQuantity: number) => {
    if (checkoutData?.type === "regular") {
      const maxStock = checkoutData.product.stock;
      if (newQuantity >= 1 && newQuantity <= maxStock) {
        setQuantity(newQuantity);
      }
    }
  };

  const calculateTotal = () => {
    if (!checkoutData) return 0;
    if (checkoutData.type === "kustom") {
      return 100000; // Default price for custom products
    } else {
      return checkoutData.product.price * quantity;
    }
  };

  const handleSubmitOrder = useCallback(async () => {
    if (!checkoutData) {
      toast.error("No checkout data available");
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let orderData: any;

      if (checkoutData.type === "kustom") {
        orderData = {
          type: "kustom",
          customer: {
            userId: checkoutData.customer.userId,
            ...customerInfo
          },
          productKustom: checkoutData.productKustom,
          design: checkoutData.design,
          metadata: checkoutData.metadata
        };
      } else {
        orderData = {
          type: "regular",
          customer: customerInfo,
          product: checkoutData.product,
          orderDetails: {
            quantity: quantity,
            orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            totalAmount: calculateTotal()
          }
        };
      }

      const response = await fetch("/api/user/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        setOrderResult(result.data);
        setOrderSuccess(true);
        toast.success("Order submitted successfully!");
        localStorage.removeItem("checkoutData");
        sessionStorage.removeItem("checkoutData");
      } else {
        toast.error(result.message || "Failed to submit order");
      }
    } catch (error) {
      console.error("Submit order error:", error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [checkoutData, customerInfo, quantity]);

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone && customerInfo.address;

  if (getStorage) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-zinc-950'>
        <div className='text-center'>
          <ShoppingCart className='w-16 h-16 text-zinc-400 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white mb-2'>Your Cart is Empty</h2>
          <p className='text-zinc-400 mb-6'>Add some products to get started</p>
          <Button onClick={() => router.push("/produk")} className='bg-blue-600 hover:bg-blue-700'>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-zinc-950'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-white' />
          <p className='text-white'>Loading checkout data...</p>
        </div>
      </div>
    );
  }

  if (orderSuccess && orderResult) {
    return (
      <div className='min-h-screen bg-zinc-950 p-4 items-center justify-center flex'>
        <div className='max-w-2xl mx-auto'>
          <Card className='bg-zinc-900 text-white border-zinc-700'>
            <CardHeader className='text-center'>
              <div className='mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4'>
                <CheckCircle className='w-8 h-8 text-white' />
              </div>
              <CardTitle className='text-2xl text-green-400'>Order Submitted Successfully!</CardTitle>
              <CardDescription className='text-zinc-400'>Your {checkoutData.type === "kustom" ? "custom design" : "product"} order has been received and is being processed.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='bg-zinc-800 p-4 rounded-lg'>
                <h3 className='font-semibold mb-3'>Order Details</h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Order ID:</span>
                    <span className='font-mono'>{orderResult.orderId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Status:</span>
                    <span className='text-yellow-400 capitalize'>{orderResult.status}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Total Amount:</span>
                    <span className='font-semibold'>Rp {Number(orderResult.totalAmount).toLocaleString("id-ID")}</span>
                  </div>
                  {orderResult.quantity && (
                    <div className='flex justify-between'>
                      <span className='text-zinc-400'>Quantity:</span>
                      <span>{orderResult.quantity}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Customer:</span>
                    <span>{orderResult.customer.name}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-zinc-400'>Product:</span>
                    <span>{orderResult.productKustom?.name || orderResult.product?.name}</span>
                  </div>
                </div>
              </div>
              <div className='flex gap-3'>
                <Button onClick={() => router.push("/products")} className='flex-1 bg-blue-600 hover:bg-blue-700'>
                  Continue Shopping
                </Button>
                <Button variant='outline' onClick={() => router.push(`/orders/${orderResult.orderId}`)} className='border-zinc-600 text-zinc-300 hover:bg-zinc-800'>
                  Track Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <Button variant='ghost' onClick={() => router.back()} className='text-zinc-400 hover:text-white mb-4'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <h1 className='text-3xl font-bold text-white'>Checkout</h1>
          <p className='text-zinc-400'>Complete your {checkoutData.type === "kustom" ? "custom design" : "product"} order</p>
        </div>

        <div className='grid lg:grid-cols-2 gap-6'>
          {/* Customer Information Form */}
          <Card className='bg-zinc-900 text-white border-zinc-700'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='w-5 h-5' />
                Customer Information
              </CardTitle>
              <CardDescription className='text-zinc-400'>Please provide your details for order processing</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name' className='flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  Full Name *
                </Label>
                <Input id='name' value={customerInfo.name} onChange={(e) => handleCustomerInfoChange("name", e.target.value)} placeholder='Enter your full name' className='bg-zinc-800 border-zinc-600 text-white' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address *</Label>
                <Input id='email' type='email' value={customerInfo.email} onChange={(e) => handleCustomerInfoChange("email", e.target.value)} placeholder='Enter your email' className='bg-zinc-800 border-zinc-600 text-white' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone' className='flex items-center gap-2'>
                  <Phone className='w-4 h-4' />
                  Phone Number *
                </Label>
                <Input id='phone' type='tel' value={customerInfo.phone} onChange={(e) => handleCustomerInfoChange("phone", e.target.value)} placeholder='Enter your phone number' className='bg-zinc-800 border-zinc-600 text-white' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='address' className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4' />
                  Delivery Address *
                </Label>
                <Textarea
                  id='address'
                  value={customerInfo.address}
                  onChange={(e) => handleCustomerInfoChange("address", e.target.value)}
                  placeholder='Enter your complete delivery address'
                  className='bg-zinc-800 border-zinc-600 text-white min-h-[80px]'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='notes'>Additional Notes (Optional)</Label>
                <Textarea
                  id='notes'
                  value={customerInfo.notes}
                  onChange={(e) => handleCustomerInfoChange("notes", e.target.value)}
                  placeholder='Any special instructions or notes'
                  className='bg-zinc-800 border-zinc-600 text-white min-h-[60px]'
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className='bg-zinc-900 text-white border-zinc-700'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='w-5 h-5' />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Product Info */}
              <div className='bg-zinc-800 p-4 rounded-lg'>
                <h4 className='font-medium mb-3 flex items-center gap-2'>
                  {checkoutData.type === "kustom" ? (
                    <>
                      <Palette className='w-4 h-4' />
                      Custom Product
                    </>
                  ) : (
                    <>
                      <Package className='w-4 h-4' />
                      Regular Product
                    </>
                  )}
                </h4>
                <div className='flex gap-3'>
                  {checkoutData.type === "kustom" ? (
                    checkoutData.productKustom.modelPhoto && <Image src={checkoutData.productKustom.modelPhoto || "/placeholder.svg"} alt={checkoutData.productKustom.modelName} width={80} height={80} className='rounded-lg object-cover' />
                  ) : checkoutData.product.images && checkoutData.product.images.length > 0 ? (
                    <Image src={checkoutData.product.images[0] || "/placeholder.svg"} alt={checkoutData.product.name} width={80} height={80} className='rounded-lg object-cover' />
                  ) : (
                    <div className='w-20 h-20 bg-zinc-700 rounded-lg flex items-center justify-center'>
                      <Package className='w-8 h-8 text-zinc-400' />
                    </div>
                  )}
                  <div className='flex-1'>
                    <h5 className='font-medium'>{checkoutData.type === "kustom" ? checkoutData.productKustom.modelName : checkoutData.product.name}</h5>
                    <p className='text-sm text-zinc-400'>{checkoutData.type === "kustom" ? "Custom 3D Model" : checkoutData.product.description}</p>
                    {checkoutData.type === "kustom" && checkoutData.productKustom.uvUrl && <p className='text-xs text-green-400'>UV Mapping Available</p>}
                    {checkoutData.type === "regular" && (
                      <div className='flex items-center gap-2 mt-1'>
                        {checkoutData.product.size && <span className='text-xs bg-zinc-700 px-2 py-1 rounded'>Size: {checkoutData.product.size}</span>}
                        {checkoutData.product.category && <span className='text-xs bg-zinc-700 px-2 py-1 rounded capitalize'>{checkoutData.product.category}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Control for Regular Products */}
              {checkoutData.type === "regular" && (
                <div className='bg-zinc-800 p-4 rounded-lg'>
                  <h4 className='font-medium mb-3'>Quantity</h4>
                  <div className='flex items-center gap-3'>
                    <Button variant='outline' size='sm' onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1} className='border-zinc-600'>
                      <Minus className='w-4 h-4' />
                    </Button>
                    <span className='text-lg font-medium w-12 text-center'>{quantity}</span>
                    <Button variant='outline' size='sm' onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= checkoutData.product.stock} className='border-zinc-600'>
                      <Plus className='w-4 h-4' />
                    </Button>
                    <span className='text-sm text-zinc-400 ml-2'>({checkoutData.product.stock} available)</span>
                  </div>
                </div>
              )}

              {/* Design Preview for Custom Products */}
              {checkoutData.type === "kustom" && (
                <div className='bg-zinc-800 p-4 rounded-lg'>
                  <h4 className='font-medium mb-3'>Design Preview</h4>
                  <div className='aspect-square bg-zinc-700 rounded-lg overflow-hidden mb-3'>
                    {checkoutData.design.designImage ? (
                      <img src={checkoutData.design.designImage || "/placeholder.svg"} alt='Design Preview' className='w-full h-full object-contain' />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-zinc-400'>
                        <Package className='w-12 h-12' />
                      </div>
                    )}
                  </div>
                  <div className='text-sm space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-zinc-400'>Design Objects:</span>
                      <span>{checkoutData.metadata.totalObjects}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-zinc-400'>Canvas Size:</span>
                      <span>
                        {checkoutData.metadata.canvasSize.width} × {checkoutData.metadata.canvasSize.height}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className='bg-zinc-800 p-4 rounded-lg'>
                <h4 className='font-medium mb-3'>Pricing</h4>
                <div className='space-y-2 text-sm'>
                  {checkoutData.type === "kustom" ? (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Base Price:</span>
                        <span>Rp 100.000</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Custom Design:</span>
                        <span>Included</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Unit Price:</span>
                        <span>Rp {checkoutData.product.price.toLocaleString("id-ID")}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Quantity:</span>
                        <span>{quantity}</span>
                      </div>
                    </>
                  )}
                  <Separator className='bg-zinc-600' />
                  <div className='flex justify-between font-semibold text-lg'>
                    <span>Total:</span>
                    <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmitOrder} disabled={!isFormValid || isSubmitting} className='w-full bg-blue-600 hover:bg-blue-700 h-12'>
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className='w-4 h-4 mr-2' />
                    Submit Order - Rp {calculateTotal().toLocaleString("id-ID")}
                  </>
                )}
              </Button>
              <p className='text-xs text-zinc-400 text-center'>By submitting this order, you agree to our terms and conditions.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
