"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, MoreHorizontal, Package, RefreshCw, ChevronLeft, ChevronRight, Download, Upload, X, FileImage, Box, ImageIcon } from "lucide-react";
import { useProductKustoms, createProductKustom, updateProductKustom, deleteProductKustom } from "@/src/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { mutate } from "swr";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Define allowed file types and max size for client-side validation
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = {
  model: ["glb", "gltf"],
  photo: ["jpg", "jpeg", "png", "webp"],
  uv: ["jpg", "jpeg", "png", "webp"]
};

export default function ProductKustomPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    modelId: "",
    name: "",
    modelUrl: "",
    photo: "",
    uvUrl: "",
    price: "",
    isActive: true
  });

  // State for temporarily holding File objects before submission
  const [newFiles, setNewFiles] = useState<{
    model: File | null;
    photo: File | null;
    uv: File | null;
  }>({
    model: null,
    photo: null,
    uv: null
  });

  // State for client-side preview URLs
  const [previewUrls, setPreviewUrls] = useState<{
    model: string | null;
    photo: string | null;
    uv: string | null;
  }>({
    model: null,
    photo: null,
    uv: null
  });

  // State to store original file URLs when editing
  const [originalProductFiles, setOriginalProductFiles] = useState<{
    modelUrl?: string | null;
    photo?: string | null;
    uvUrl?: string | null;
  }>({});

  // File input refs
  const modelFileRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const uvFileRef = useRef<HTMLInputElement>(null);

  const { data, error, isLoading } = useProductKustoms(page, 10, search);

  // Cleanup preview URLs when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (previewUrls.model) URL.revokeObjectURL(previewUrls.model);
      if (previewUrls.photo) URL.revokeObjectURL(previewUrls.photo);
      if (previewUrls.uv) URL.revokeObjectURL(previewUrls.uv);
    };
  }, [previewUrls]);

  const resetForm = () => {
    setFormData({
      modelId: "",
      name: "",
      modelUrl: "",
      photo: "",
      uvUrl: "",
      price: "",
      isActive: true
    });
    setNewFiles({ model: null, photo: null, uv: null });
    if (previewUrls.model) URL.revokeObjectURL(previewUrls.model);
    if (previewUrls.photo) URL.revokeObjectURL(previewUrls.photo);
    if (previewUrls.uv) URL.revokeObjectURL(previewUrls.uv);
    setPreviewUrls({ model: null, photo: null, uv: null });
    setOriginalProductFiles({});
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: "model" | "photo" | "uv") => {
    const file = event.target.files?.[0];
    if (file) {
      // Client-side validation for file size and type
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File size for ${type} exceeds ${MAX_FILE_SIZE_MB}MB.`);
        event.target.value = "";
        return;
      }
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !ALLOWED_TYPES[type].includes(fileExtension)) {
        toast.error(`Invalid file type for ${type}. Allowed: ${ALLOWED_TYPES[type].join(", ")}.`);
        event.target.value = "";
        return;
      }

      setNewFiles((prev) => ({ ...prev, [type]: file }));
      setPreviewUrls((prev) => {
        const oldUrl = prev[type];
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return { ...prev, [type]: URL.createObjectURL(file) };
      });
      setFormData((prev) => ({ ...prev, [type === "model" ? "modelUrl" : type === "photo" ? "photo" : "uvUrl"]: "" }));
    } else {
      setNewFiles((prev) => ({ ...prev, [type]: null }));
      setPreviewUrls((prev) => {
        const oldUrl = prev[type];
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return { ...prev, [type]: null };
      });
      const currentUrlKey = type === "model" ? "modelUrl" : type === "photo" ? "photo" : "uvUrl";
      setFormData((prev) => ({ ...prev, [currentUrlKey]: originalProductFiles[currentUrlKey] || "" }));
    }
  };

  const removeFile = (type: "model" | "photo" | "uv") => {
    setNewFiles((prev) => ({ ...prev, [type]: null }));
    setPreviewUrls((prev) => {
      const oldUrl = prev[type];
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      return { ...prev, [type]: null };
    });
    setFormData((prev) => ({ ...prev, [type === "model" ? "modelUrl" : type === "photo" ? "photo" : "uvUrl"]: "" }));
    const fileInput = type === "model" ? modelFileRef.current : type === "photo" ? photoFileRef.current : uvFileRef.current;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleCreate = async () => {
    if (!formData.modelId || !formData.name || formData.price <= 0) {
      toast.error("Lengkapi Formulir Produk tersebut.");
      return;
    }
    if (!newFiles.model) {
      toast.error("3D Model File is required for new products.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProductKustom(formData, newFiles);
      if (result) {
        mutate(`/api/admin/productKustom?page=${page}&limit=10${search ? `&search=${search}` : ""}`);
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
    if (!formData.modelId || !formData.name || formData.price <= 0) {
      toast.error("Please fill in Model ID, Product Name, and a valid Price.");
      return;
    }
    if (!newFiles.model && !formData.modelUrl && !originalProductFiles.modelUrl) {
      toast.error("3D Model File is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProductKustom(selectedProduct.id, formData, newFiles, originalProductFiles);
      if (result) {
        mutate(`/api/admin/productKustom?page=${page}&limit=10${search ? `&search=${search}` : ""}`);
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
      const filesToDelete = [];
      if (selectedProduct.modelUrl) filesToDelete.push(selectedProduct.modelUrl);
      if (selectedProduct.photo) filesToDelete.push(selectedProduct.photo);
      if (selectedProduct.uvUrl) filesToDelete.push(selectedProduct.uvUrl);

      const result = await deleteProductKustom(selectedProduct.id, filesToDelete);
      if (result) {
        mutate(`/api/admin/productKustom?page=${page}&limit=10${search ? `&search=${search}` : ""}`);
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

  const openEditDialog = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      modelId: product.modelId,
      name: product.name,
      modelUrl: product.modelUrl || "",
      photo: product.photo || "",
      uvUrl: product.uvUrl || "",
      price: product.price || "",
      isActive: product.isActive
    });
    setOriginalProductFiles({
      modelUrl: product.modelUrl || null,
      photo: product.photo || null,
      uvUrl: product.uvUrl || null
    });
    setNewFiles({ model: null, photo: null, uv: null });
    if (previewUrls.model) URL.revokeObjectURL(previewUrls.model);
    if (previewUrls.photo) URL.revokeObjectURL(previewUrls.photo);
    if (previewUrls.uv) URL.revokeObjectURL(previewUrls.uv);
    setPreviewUrls({ model: null, photo: null, uv: null });
    setIsEditDialogOpen(true);
  };

  const exportProducts = () => {
    if (!data?.data.productKustom) return;
    const csvContent = [
      ["Model ID", "Name", "Price", "Orders", "Status", "Created"].join(","),
      ...data.data.productKustom.map((product: any) => [product.modelId, product.name, product.price, product._count?.orders || 0, product.isActive ? "Active" : "Inactive", new Date(product.createdAt).toLocaleDateString()].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-kustom.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Products exported successfully");
  };

  const formatCurrency = (amount: string | number) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  };

  const FileUploadSection = ({ type, label, accept, currentUrl, previewUrl, icon: Icon }: { type: "model" | "photo" | "uv"; label: string; accept: string; currentUrl: string; previewUrl: string | null; icon: any }) => {
    const displayUrl = previewUrl || currentUrl;
    return (
      <div className='space-y-2'>
        <Label className='text-zinc-300'>{label}</Label>
        <div className='border-2 border-dashed border-zinc-600 rounded-lg p-4'>
          {displayUrl ? (
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Icon className='w-4 h-4 text-zinc-400' />
                <span className='text-sm text-zinc-300 truncate max-w-[200px]'>{displayUrl.split("/").pop()}</span>
              </div>
              <Button type='button' variant='ghost' size='sm' onClick={() => removeFile(type)} className='text-red-400 hover:text-red-300'>
                <X className='w-4 h-4' />
              </Button>
            </div>
          ) : (
            <div className='text-center'>
              <Icon className='w-8 h-8 text-zinc-400 mx-auto mb-2' />
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  const fileInput = type === "model" ? modelFileRef.current : type === "photo" ? photoFileRef.current : uvFileRef.current;
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
                className='text-zinc-300 hover:text-white'
              >
                <Upload className='w-4 h-4 mr-2' />
                Upload {label}
              </Button>
              <p className='text-xs text-zinc-500 mt-1'>{accept}</p>
            </div>
          )}
        </div>
        <input
          ref={type === "model" ? modelFileRef : type === "photo" ? photoFileRef : uvFileRef}
          type='file'
          accept={accept
            .split(",")
            .map((ext) => `.${ext.trim()}`)
            .join(",")}
          onChange={(e) => handleFileChange(e, type)}
          className='hidden'
        />
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
          <h1 className='text-3xl font-bold text-white'>Kustomisasi Products</h1>
          <p className='text-zinc-400'>Manage 3D models and customizable products</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={exportProducts} variant='outline' className='border-zinc-600 text-zinc-300 bg-transparent'>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
          <Button
            onClick={() => {
              setIsCreateDialogOpen(true);
              resetForm();
            }}
            className='bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className='bg-zinc-900 border-zinc-700'>
        <CardContent className='p-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4' />
            <Input placeholder='Search products by name or model ID...' value={search} onChange={(e) => setSearch(e.target.value)} className='pl-10 bg-zinc-800 border-zinc-600 text-white' />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className='bg-zinc-900 border-zinc-700'>
        <CardHeader>
          <CardTitle className='text-white'>Products {data?.data.pagination?.total ? `(${data.data.pagination.total})` : ""}</CardTitle>
          <CardDescription className='text-zinc-400'>3D models and product information</CardDescription>
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
              <ScrollArea>
                <Table>
                  <TableHeader>
                    <TableRow className='border-zinc-700'>
                      <TableHead className='text-zinc-300'>Product</TableHead>
                      <TableHead className='text-zinc-300'>Model ID</TableHead>
                      <TableHead className='text-zinc-300'>Price</TableHead>
                      <TableHead className='text-zinc-300'>Orders</TableHead>
                      <TableHead className='text-zinc-300'>Status</TableHead>
                      <TableHead className='text-zinc-300'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.productKustom?.map((product: any) => (
                      <TableRow key={product.id} className='border-zinc-700'>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {product.photo ? (
                              <img src={product.photo || "/placeholder.svg"} alt={product.name} className='w-12 h-12 rounded object-cover' />
                            ) : (
                              <div className='w-12 h-12 bg-zinc-700 rounded flex items-center justify-center'>
                                <Package className='w-6 h-6 text-zinc-400' />
                              </div>
                            )}
                            <div>
                              <p className='font-medium text-white'>{product.name}</p>
                              <p className='text-sm text-zinc-400'>{product.uvUrl ? "UV Available" : "No UV"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='font-mono text-sm text-zinc-300'>{product.modelId}</TableCell>
                        <TableCell className='font-medium text-white'>{formatCurrency(product.price)}</TableCell>
                        <TableCell className='text-zinc-300'>{product._count?.orders || 0}</TableCell>
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
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
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
            <DialogTitle className='text-white'>Add New Kustom Product</DialogTitle>
            <DialogDescription className='text-zinc-400'>Create a new 3D model product with file uploads</DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>Basic Information</h3>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>
                  Model ID <span className='text-red-500'>*</span>
                </Label>
                <Input value={formData.modelId} onChange={(e) => setFormData({ ...formData, modelId: e.target.value })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='e.g., TSHIRT_001' />
              </div>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>
                  Product Name <span className='text-red-500'>*</span>
                </Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='e.g., Basic T-Shirt' />
              </div>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>
                  Price (Rp) <span className='text-red-500'>*</span>
                </Label>
                <Input type='number' value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value || "" })} className='bg-zinc-800 border-zinc-600 text-white' placeholder='100000' />
              </div>
              <div className='flex items-center space-x-2'>
                <input id='create-isActive' type='checkbox' checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className='rounded border-zinc-600 bg-zinc-800' />
                <Label htmlFor='create-isActive' className='text-zinc-300'>
                  Active
                </Label>
              </div>
            </div>
            {/* File Uploads */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>File Uploads</h3>
              <FileUploadSection type='model' label='3D Model File *' accept={ALLOWED_TYPES.model.join(",")} currentUrl={formData.modelUrl} previewUrl={previewUrls.model} icon={Box} />
              <FileUploadSection type='photo' label='Product Photo' accept={ALLOWED_TYPES.photo.join(",")} currentUrl={formData.photo} previewUrl={previewUrls.photo} icon={ImageIcon} />
              <FileUploadSection type='uv' label='UV Texture' accept={ALLOWED_TYPES.uv.join(",")} currentUrl={formData.uvUrl} previewUrl={previewUrls.uv} icon={FileImage} />
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
            <Button onClick={handleCreate} disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-700 max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-white'>Edit Kustom Product</DialogTitle>
            <DialogDescription className='text-zinc-400'>Update product information and files</DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>Basic Information</h3>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>Model ID</Label>
                <Input value={formData.modelId} disabled className='bg-zinc-800 border-zinc-600 text-zinc-400' />
              </div>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>
                  Product Name <span className='text-red-500'>*</span>
                </Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className='bg-zinc-800 border-zinc-600 text-white' />
              </div>
              <div className='space-y-2'>
                <Label className='text-zinc-300'>
                  Price (Rp) <span className='text-red-500'>*</span>
                </Label>
                <Input type='number' value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value || "" })} className='bg-zinc-800 border-zinc-600 text-white' />
              </div>
              <div className='flex items-center space-x-2'>
                <input id='edit-isActive' type='checkbox' checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className='rounded border-zinc-600 bg-zinc-800' />
                <Label htmlFor='edit-isActive' className='text-zinc-300'>
                  Active
                </Label>
              </div>
            </div>
            {/* File Uploads */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-white'>File Uploads</h3>
              <FileUploadSection type='model' label='3D Model File *' accept={ALLOWED_TYPES.model.join(",")} currentUrl={formData.modelUrl} previewUrl={previewUrls.model} icon={Box} />
              <FileUploadSection type='photo' label='Product Photo' accept={ALLOWED_TYPES.photo.join(",")} currentUrl={formData.photo} previewUrl={previewUrls.photo} icon={ImageIcon} />
              <FileUploadSection type='uv' label='UV Texture' accept={ALLOWED_TYPES.uv.join(",")} currentUrl={formData.uvUrl} previewUrl={previewUrls.uv} icon={FileImage} />
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
            <DialogDescription className='text-zinc-400'>Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone and will also delete associated files.</DialogDescription>
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
