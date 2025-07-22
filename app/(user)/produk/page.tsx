"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, ShoppingCart, Grid3X3, List, ChevronLeft, ChevronRight, Eye, Heart, Palette } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProductKustom {
  id: string;
  modelId: string;
  name: string;
  modelUrl: string;
  photo?: string;
  uvUrl?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

interface Product {
  id: string;
  name: string;
  description?: string;
  size: string;
  likes: number;
  price: number;
  stock: number;
  category?: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

const PRODUCT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports" },
  { value: "toys", label: "Toys" },
  { value: "beauty", label: "Beauty" },
  { value: "automotive", label: "Automotive" }
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" }
];

export default function ProductsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [productKustoms, setProductKustoms] = useState<ProductKustom[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [activeTab, search, category, sortBy, page]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "kustom" || activeTab === "all") {
        const kustomResponse = await fetch(`/api/admin/productKustom?page=${page}&limit=12&search=${search}`);
        const kustomData = await kustomResponse.json();
        if (kustomData.success) {
          setProductKustoms(kustomData.data.productKustom || []);
        }
      }

      if (activeTab === "regular" || activeTab === "all") {
        const regularResponse = await fetch(`/api/admin/products?page=${page}&limit=12&search=${search}&category=${category}`);
        const regularData = await regularResponse.json();
        if (regularData.success) {
          setProducts(regularData.data.products || []);
          setPagination(regularData.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  };

  const handleAddToCart = (product: ProductKustom | Product, type: "kustom" | "regular") => {
    if (type === "kustom") {
      // For custom products, redirect to designer
      router.push(`/kustomisasi?productId=${product.id}`);
    } else {
      // For regular products, add to checkout
      const checkoutData = {
        type: "regular",
        product: product as Product,
        quantity: 1,
        timestamp: Date.now()
      };
      sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      router.push("/checkout");
    }
  };

  const ProductKustomCard = ({ product }: { product: ProductKustom }) => (
    <Card className='bg-zinc-900 border-zinc-700 hover:border-zinc-600 transition-colors group'>
      <CardContent className='p-0'>
        <div className='relative aspect-square overflow-hidden rounded-t-lg'>
          {product.photo ? (
            <Image src={product.photo || "/placeholder.svg"} alt={product.name} fill className='object-cover group-hover:scale-105 transition-transform duration-300' />
          ) : (
            <div className='w-full h-full bg-zinc-800 flex items-center justify-center'>
              <Package className='w-12 h-12 text-zinc-400' />
            </div>
          )}
          <div className='absolute top-2 left-2'>
            <Badge className='bg-purple-600 text-white'>
              <Palette className='w-3 h-3 mr-1' />
              Custom
            </Badge>
          </div>
          <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
            <Button size='sm' variant='secondary' className='h-8 w-8 p-0'>
              <Eye className='w-4 h-4' />
            </Button>
          </div>
        </div>
        <div className='p-4'>
          <h3 className='font-semibold text-white mb-1 line-clamp-1'>{product.name}</h3>
          <p className='text-sm text-zinc-400 mb-2'>Model ID: {product.modelId}</p>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-lg font-bold text-white'>{formatCurrency(product.price)}</span>
            <div className='flex items-center gap-1 text-sm text-zinc-400'>
              <ShoppingCart className='w-4 h-4' />
              {product._count.orders}
            </div>
          </div>
          <Button onClick={() => handleAddToCart(product, "kustom")} className='w-full bg-purple-600 hover:bg-purple-700'>
            <Palette className='w-4 h-4 mr-2' />
            Customize Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className='bg-zinc-900 border-zinc-700 hover:border-zinc-600 transition-colors group'>
      <CardContent className='p-0'>
        <div className='relative aspect-square overflow-hidden rounded-t-lg'>
          {product.images && product.images.length > 0 ? (
            <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className='object-cover group-hover:scale-105 transition-transform duration-300' />
          ) : (
            <div className='w-full h-full bg-zinc-800 flex items-center justify-center'>
              <Package className='w-12 h-12 text-zinc-400' />
            </div>
          )}
          {product.images && product.images.length > 1 && (
            <div className='absolute top-2 left-2'>
              <Badge variant='secondary' className='bg-zinc-800 text-white'>
                +{product.images.length - 1}
              </Badge>
            </div>
          )}
          <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
            <Button size='sm' variant='secondary' className='h-8 w-8 p-0'>
              <Heart className='w-4 h-4' />
            </Button>
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <div className='absolute bottom-2 left-2'>
              <Badge variant='destructive'>Low Stock</Badge>
            </div>
          )}
        </div>
        <div className='p-4'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='font-semibold text-white line-clamp-1 flex-1'>{product.name}</h3>
            <Badge variant='outline' className='text-xs'>
              {product.size}
            </Badge>
          </div>
          <p className='text-sm text-zinc-400 mb-2 line-clamp-2'>{product.description || "No description available"}</p>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-lg font-bold text-white'>{formatCurrency(product.price)}</span>
            <div className='flex items-center gap-2 text-sm text-zinc-400'>
              <div className='flex items-center gap-1'>
                <Heart className='w-4 h-4' />
                {product.likes}
              </div>
              <div className='flex items-center gap-1'>
                <Package className='w-4 h-4' />
                {product.stock}
              </div>
            </div>
          </div>
          <Button onClick={() => handleAddToCart(product, "regular")} disabled={product.stock === 0} className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700'>
            <ShoppingCart className='w-4 h-4 mr-2' />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const allProducts = [...productKustoms.map((p) => ({ ...p, type: "kustom" as const })), ...products.map((p) => ({ ...p, type: "regular" as const }))];

  const filteredProducts = allProducts.filter((product) => {
    if (activeTab === "kustom") return product.type === "kustom";
    if (activeTab === "regular") return product.type === "regular";
    return true;
  });

  return (
    <div className='min-h-screen bg-zinc-950 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Our Products</h1>
          <p className='text-zinc-400'>Discover our collection of custom and regular products</p>
        </div>

        {/* Filters */}
        <Card className='bg-zinc-900 border-zinc-700 mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row gap-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4' />
                <Input placeholder='Search products...' value={search} onChange={(e) => setSearch(e.target.value)} className='pl-10 bg-zinc-800 border-zinc-600 text-white' />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className='w-48 bg-zinc-800 border-zinc-600 text-white'>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-48 bg-zinc-800 border-zinc-600 text-white'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='flex gap-2'>
                <Button variant={viewMode === "grid" ? "default" : "outline"} size='sm' onClick={() => setViewMode("grid")} className='border-zinc-600'>
                  <Grid3X3 className='w-4 h-4' />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size='sm' onClick={() => setViewMode("list")} className='border-zinc-600'>
                  <List className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='mb-6'>
          <TabsList className='bg-zinc-900 border-zinc-700'>
            <TabsTrigger value='all' className='data-[state=active]:bg-zinc-700'>
              All Products ({allProducts.length})
            </TabsTrigger>
            <TabsTrigger value='kustom' className='data-[state=active]:bg-zinc-700'>
              Custom Products ({productKustoms.length})
            </TabsTrigger>
            <TabsTrigger value='regular' className='data-[state=active]:bg-zinc-700'>
              Regular Products ({products.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-6'>
            {isLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className='bg-zinc-900 border-zinc-700'>
                    <CardContent className='p-0'>
                      <div className='aspect-square bg-zinc-800 rounded-t-lg animate-pulse' />
                      <div className='p-4 space-y-3'>
                        <div className='h-4 bg-zinc-800 rounded animate-pulse' />
                        <div className='h-3 bg-zinc-800 rounded animate-pulse w-2/3' />
                        <div className='h-6 bg-zinc-800 rounded animate-pulse w-1/2' />
                        <div className='h-10 bg-zinc-800 rounded animate-pulse' />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className='text-center py-12'>
                <Package className='w-16 h-16 text-zinc-400 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-white mb-2'>No Products Found</h3>
                <p className='text-zinc-400'>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredProducts.map((product) => (product.type === "kustom" ? <ProductKustomCard key={`kustom-${product.id}`} product={product} /> : <ProductCard key={`regular-${product.id}`} product={product} />))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className='flex items-center justify-center gap-2 mt-8'>
            <Button variant='outline' size='sm' onClick={() => setPage(page - 1)} disabled={page === 1} className='border-zinc-600 text-zinc-300'>
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <span className='text-sm text-zinc-300'>
              Page {page} of {pagination.pages}
            </span>
            <Button variant='outline' size='sm' onClick={() => setPage(page + 1)} disabled={page === pagination.pages} className='border-zinc-600 text-zinc-300'>
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
