"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, MoreHorizontal, Package, RefreshCw, ChevronLeft, ChevronRight, Download, Upload, X, ImageIcon } from "lucide-react";
import { useProducts, createProduct, updateProduct, deleteProduct, type Product } from "@/src/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { mutate } from "swr";

// Product categories
const PRODUCT_CATEGORIES_FILTER = [
  { value: "all", label: "All" },
  { value: "kemeja", label: "Kemeja" },
  { value: "kaos", label: "Kaos" },
  { value: "sweater", label: "Sweater" },
  { value: "hijab", label: "Hijab" },
  { value: "topi", label: "Topi" },
  { value: "kaos_kaki", label: "Kaos Kaki" },
  { value: "hoodie", label: "Hoodie" },
  { value: "sepatu", label: "Sepatu" }
];

const PRODUCT_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "kemeja", label: "Kemeja" },
  { value: "kaos", label: "Kaos" },
  { value: "sweater", label: "Sweater" },
  { value: "hijab", label: "Hijab" },
  { value: "topi", label: "Topi" },
  { value: "kaos_kaki", label: "Kaos Kaki" },
  { value: "hoodie", label: "Hoodie" },
  { value: "sepatu", label: "Sepatu" }
];

const SIZES = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" }
];

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES_COUNT = 5;
const ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png", "webp"];

export default function ProductRegularPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: "M",
    price: "",
    stock: "",
    category: "electronics",
    images: [] as string[], // Changed to array
    isActive: true
  });

  // State for file upload - Changed to multiple files
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, error, isLoading } = useProducts(page, 10, search, categoryFilter);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      size: "M",
      price: "",
      stock: "",
      category: "electronics",
      images: [],
      isActive: true
    });
    setNewFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setOriginalImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Check total count including existing images
    const totalCount = newFiles.length + formData.images.length + files.length;
    if (totalCount > MAX_IMAGES_COUNT) {
      toast.error(`Maximum ${MAX_IMAGES_COUNT} images allowed`);
      event.target.value = "";
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB`);
        event.target.value = "";
        return;
      }
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !ALLOWED_IMAGE_TYPES.includes(fileExtension)) {
        toast.error(`Invalid file type for ${file.name}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`);
        event.target.value = "";
        return;
      }
    }

    // Add new files and create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setNewFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeNewFile = (index: number) => {
    const newFilesCopy = [...newFiles];
    const previewUrlsCopy = [...previewUrls];

    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrlsCopy[index]);

    newFilesCopy.splice(index, 1);
    previewUrlsCopy.splice(index, 1);

    setNewFiles(newFilesCopy);
    setPreviewUrls(previewUrlsCopy);
  };

  const removeExistingImage = (index: number) => {
    const imagesCopy = [...formData.images];
    imagesCopy.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: imagesCopy }));
  };

  const handleCreate = async () => {
    if (!formData.name || formData.price <= 0 || formData.stock < 0) {
      toast.error("Please fill in required fields with valid values.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProduct(formData, { images: newFiles });
      if (result) {
        mutate(`/api/admin/products?page=${page}&limit=10${search ? `&search=${search}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}`);
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success("Product created successfully");
      } else {
        toast.error("Failed to create product.");
      }
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;
    if (!formData.name || formData.price <= 0 || formData.stock < 0) {
      toast.error("Please fill in required fields with valid values.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProduct(selectedProduct.id, formData, { images: newFiles }, { images: originalImages });
      if (result) {
        mutate(`/api/admin/products?page=${page}&limit=10${search ? `&search=${search}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}`);
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        resetForm();
        toast.success("Product updated successfully");
      } else {
        toast.error("Failed to update product.");
      }
    } catch (error: any) {
      console.error("Failed to update product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      const result = await deleteProduct(selectedProduct.id, selectedProduct.images);
      if (result) {
        mutate(`/api/admin/products?page=${page}&limit=10${search ? `&search=${search}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}`);
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        toast.success("Product deleted successfully");
      } else {
        toast.error("Failed to delete product.");
      }
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      size: product.size,
      price: Number(product.price),
      stock: product.stock,
      category: product.category || "electronics",
      images: product.images || [],
      isActive: product.isActive
    });
    setOriginalImages(product.images || []);
    setNewFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setIsEditDialogOpen(true);
  };

  const exportProducts = () => {
    if (!data?.data.products) return;
    const csvContent = [
      ["Name", "Description", "Size", "Price", "Stock", "Category", "Orders", "Status", "Created"].join(","),
      ...data.data.products.map((product: Product) =>
        [
          product.name,
          product.description || "",
          product.size,
          product.price,
          product.stock,
          product.category || "electronics",
          product._count.orders,
          product.isActive ? "Active" : "Inactive",
          new Date(product.createdAt).toLocaleDateString()
        ].join(",")
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Products exported successfully");
  };

  const formatCurrency = (amount: string | number) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  };

  const MultipleImageUploadSection = () => {
    const totalImages = formData.images.length + newFiles.length;

    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label className='text-zinc-300'>Product Images</Label>
          <span className='text-xs text-zinc-500'>
            {totalImages}/{MAX_IMAGES_COUNT} images
          </span>
        </div>

        {/* Existing Images */}
        {formData.images.length > 0 && (
          <div className='space-y-2'>
            <Label className='text-sm text-zinc-400'>Current Images</Label>
            <div className='grid grid-cols-2 gap-2'>
              {formData.images.map((imageUrl, index) => (
                <div key={`existing-${index}`} className='relative group'>
                  <img src={imageUrl || "/placeholder.svg"} alt={`Product ${index + 1}`} className='w-full h-24 object-cover rounded border border-zinc-600' />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeExistingImage(index)}
                    className='absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='w-3 h-3' />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images Preview */}
        {newFiles.length > 0 && (
          <div className='space-y-2'>
            <Label className='text-sm text-zinc-400'>New Images</Label>
            <div className='grid grid-cols-2 gap-2'>
              {previewUrls.map((previewUrl, index) => (
                <div key={`new-${index}`} className='relative group'>
                  <img src={previewUrl || "/placeholder.svg"} alt={`New ${index + 1}`} className='w-full h-24 object-cover rounded border border-zinc-600' />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeNewFile(index)}
                    className='absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='w-3 h-3' />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Area */}
        {totalImages < MAX_IMAGES_COUNT && (
          <div className='border-2 border-dashed border-zinc-600 rounded-lg p-4'>
            <div className='text-center'>
              <ImageIcon className='w-8 h-8 text-zinc-400 mx-auto mb-2' />
              <Button type='button' variant='ghost' onClick={() => fileInputRef.current?.click()} className='text-zinc-300 hover:text-white'>
                <Upload className='w-4 h-4 mr-2' />
                Add Images
              </Button>
              <p className='text-xs text-zinc-500 mt-1'>JPG, PNG, WEBP up to {MAX_FILE_SIZE_MB}MB each</p>
              <p className='text-xs text-zinc-500'>{MAX_IMAGES_COUNT - totalImages} more images allowed</p>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type='file' accept={ALLOWED_IMAGE_TYPES.map((ext) => `.${ext}`).join(",")} onChange={handleFileChange} multiple className='hidden' />
      </div>
    );
  };

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-400'>Failed to load products</p>
        <Button onClick={() => window.location.reload()} className='mt-4'>
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
          <h1 className='text-3xl font-bold text-white'>Regular Products</h1>
          <p className='text-zinc-400'>Manage your regular product inventory</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={exportProducts} variant='outline' className='border-zinc-600 text-zinc-300 bg-transparent'>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className='bg-zinc-900 border-zinc-700'>
        <CardContent className='p-6'>
          <div className='flex gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4' />
              <Input placeholder='Search products by name or description...' value={search} onChange={(e) => setSearch(e.target.value)} className='pl-10 bg-zinc-800 border-zinc-600 text-white' />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-48 bg-zinc-800 border-zinc-600 text-white'>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES_FILTER.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className='bg-zinc-900 border-zinc-700'>
        <CardHeader>
          <CardTitle className='text-white'>Products {data?.data.pagination?.total ? `(${data.data.pagination.total})` : ""}</CardTitle>
          <CardDescription className='text-zinc-400'>Manage your product inventory</CardDescription>
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
                    <TableHead className='text-zinc-300'>Product</TableHead>
                    <TableHead className='text-zinc-300'>Category</TableHead>
                    <TableHead className='text-zinc-300'>Size</TableHead>
                    <TableHead className='text-zinc-300'>Price</TableHead>
                    <TableHead className='text-zinc-300'>Stock</TableHead>
                    <TableHead className='text-zinc-300'>Orders</TableHead>
                    <TableHead className='text-zinc-300'>Status</TableHead>
                    <TableHead className='text-zinc-300'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.products?.map((product: Product) => (
                    <TableRow key={product.id} className='border-zinc-700'>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          {product.images && product.images.length > 0 ? (
                            <div className='relative'>
                              <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className='w-12 h-12 rounded object-cover' />
                              {product.images.length > 1 && <span className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{product.images.length}</span>}
                            </div>
                          ) : (
                            <div className='w-12 h-12 bg-zinc-700 rounded flex items-center justify-center'>
                              <Package className='w-6 h-6 text-zinc-400' />
                            </div>
                          )}
                          <div>
                            <p className='font-medium text-white'>{product.name}</p>
                            <p className='text-sm text-zinc-400 truncate max-w-[200px]'>{product.description || "No description"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-zinc-300'>
                        {product.category ? (
                          <Badge variant='outline' className='bg-zinc-800 text-zinc-300'>
                            {PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label || product.category}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className='text-zinc-300'>
                        <Badge variant='outline' className='bg-zinc-800 text-zinc-300'>
                          {product.size}
                        </Badge>
                      </TableCell>
                      <TableCell className='font-medium text-white'>{formatCurrency(product.price)}</TableCell>
                      <TableCell className='text-zinc-300'>{product.stock}</TableCell>
                      <TableCell className='text-zinc-300'>{product._count.orders}</TableCell>
                      <TableCell>
                        <Badge className={product.isActive ? "bg-green-500" : "bg-red-500"}>{product.isActive ? "Active" : "Inactive"}</Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => openEditDialog(product)} className='text-zinc-300 hover:bg-zinc-700'>
                              <Edit className='mr-2 h-4 w-4' />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsDeleteDialogOpen(true);
                              }}
                              className='text-red-400 hover:bg-zinc-700'
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              Delete Product
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
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.data.pagination.total)} of {data.data.pagination.total} products
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

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-700 max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-white'>Add New Product</DialogTitle>
            <DialogDescription className='text-zinc-400'>Create a new product in your inventory</DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>Basic Information</h3>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>
                  Product Name <span className='text-red-500'>*</span>
                </Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='Enter product name' />
              </div>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='Enter product description' rows={3} />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className='bg-zinc-800 border-zinc-600 text-white'>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger className='bg-zinc-800 border-zinc-600 text-white'>
                      <SelectValue placeholder='Select size' />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>
                    Price <span className='text-red-500'>*</span>
                  </Label>
                  <Input type='number' value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value || "" })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='0' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>
                    Stock <span className='text-red-500'>*</span>
                  </Label>
                  <Input type='number' value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value || "" })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='0' />
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <input id='create-isActive' type='checkbox' checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className='rounded border-zinc-600 bg-zinc-800' />
                <Label htmlFor='create-isActive' className='text-zinc-300'>
                  Active
                </Label>
              </div>
            </div>
            {/* Multiple Image Upload */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>Product Images</h3>
              <MultipleImageUploadSection />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
              className='border-zinc-600 text-zinc-300 bg-transparent'
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-700 max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-white'>Edit Product</DialogTitle>
            <DialogDescription className='text-zinc-400'>Update product information</DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>Basic Information</h3>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>
                  Product Name <span className='text-red-500'>*</span>
                </Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='Enter product name' />
              </div>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='Enter product description' rows={3} />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className='bg-zinc-800 border-zinc-600 text-white'>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger className='bg-zinc-800 border-zinc-600 text-white'>
                      <SelectValue placeholder='Select size' />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>
                    Price <span className='text-red-500'>*</span>
                  </Label>
                  <Input type='number' value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value || "" })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='0' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-zinc-300'>
                    Stock <span className='text-red-500'>*</span>
                  </Label>
                  <Input type='number' value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value || "" })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='0' />
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <input id='edit-isActive' type='checkbox' checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className='rounded border-zinc-600 bg-zinc-800' />
                <Label htmlFor='edit-isActive' className='text-zinc-300'>
                  Active
                </Label>
              </div>
            </div>
            {/* Multiple Image Upload */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>Product Images</h3>
              <MultipleImageUploadSection />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedProduct(null);
                resetForm();
              }}
              className='border-zinc-600 text-zinc-300 bg-transparent'
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-700'>
          <DialogHeader>
            <DialogTitle className='text-white'>Delete Product</DialogTitle>
            <DialogDescription className='text-zinc-400'>Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone and will also delete all associated images.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedProduct(null);
              }}
              className='border-zinc-600 text-zinc-300 bg-transparent'
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isSubmitting} className='bg-red-600 hover:bg-red-700 text-white'>
              {isSubmitting ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
