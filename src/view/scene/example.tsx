"use client";
import type React from "react";
import { useEffect, useRef, useState, Suspense, useCallback, useMemo, memo } from "react";
import { FabricImage, Canvas as FabricCanvas, Rect, Circle as FabricCircle, FabricText, type FabricObjectProps, type FabricObject } from "fabric";
import { useFrame, useThree, Canvas } from "@react-three/fiber";
import { Center, Text, useGLTF, PerspectiveCamera, CameraControls, ContactShadows, Resize, Html, Grid, Box } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, Square, Circle, Type, Palette, Download, Eye, GripVertical, Camera, X, RotateCcw, Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import dynamic from "next/dynamic";
import { buttonGroup, folder, Leva, LevaPanel, useControls, useCreateStore } from "leva";
import { Lighting } from "@/src/dom/View";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Types
interface ModelData {
  id: string;
  name: string;
  modelUrl: string;
  photo: string;
  uvUrl?: string;
}

// Fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const View = dynamic(() => import("@/src/dom/View").then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <Loader2 className='h-16 w-16 animate-spin text-neutral-800' />
    </div>
  )
});

// Dynamic imports for AR components
const InstantTracker = dynamic(() => import("@zappar/zappar-react-three-fiber").then((mod) => mod.InstantTracker), {
  ssr: false
});

const ZapparCamera = dynamic(() => import("@zappar/zappar-react-three-fiber").then((mod) => mod.ZapparCamera), {
  ssr: false
});

const BrowserCompatibility = dynamic(() => import("@zappar/zappar-react-three-fiber").then((mod) => mod.BrowserCompatibility), { ssr: false });

const CANVAS_CONFIG = {
  width: 1024,
  height: 1024,
  defaultFontSize: 24,
  defaultFontFamily: "Arial"
} as const;

// FIXED: Simplified global config - consistent positioning
const GLOBAL_3D_CONFIG = {
  // World origin - all models will be centered here
  worldPosition: [0, 0, 0] as [number, number, number],
  worldRotation: [0, 0, 0] as [number, number, number],
  // Standard scale multiplier
  baseScale: 1,
  // AR scale multiplier
  arScale: 2
} as const;

// Memoized color picker component
const ColorPicker = memo(({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div className='space-y-2'>
    <Label className='text-white/80'>{label}</Label>
    <div className='flex gap-2'>
      <Input type='color' value={value} onChange={(e) => onChange(e.target.value)} className='w-12 h-8 px-1 py-0.5 border-current/20 bg-zinc-800 rounded' />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className='flex-1 text-xs bg-zinc-800 border-zinc-600 text-white' />
    </div>
  </div>
));

// Helper debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// GL Context Initializer for Zappar
const GLContextInitializer = () => {
  const { gl } = useThree();
  useEffect(() => {
    const initializeContext = async () => {
      try {
        const ZapparThree = await import("@zappar/zappar-threejs");
        if (gl && gl.getContext) {
          gl.getError();
          ZapparThree.glContextSet(gl.getContext());
        }
      } catch (error) {
        console.warn("Failed to initialize Zappar GL context:", error);
      }
    };
    initializeContext();
  }, [gl]);
  return null;
};

// FIXED: Simple Model Placeholder - always at world origin
const ModelPlaceholder = memo(() => {
  return (
    <group position={GLOBAL_3D_CONFIG.worldPosition} rotation={GLOBAL_3D_CONFIG.worldRotation}>
      <Box args={[1, 1.5, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color='#444444' transparent opacity={0.5} />
      </Box>
      <Text fontSize={0.1} color='white' anchorX='center' anchorY='middle' position={[0, 0, 0.1]}>
        Select a Model
      </Text>
    </group>
  );
});

// FIXED: Simplified model bounds calculation
const useModelBounds = (scene: THREE.Group | THREE.Object3D | null) => {
  return useMemo(() => {
    if (!scene) {
      return {
        center: new THREE.Vector3(0, 0, 0),
        size: new THREE.Vector3(1, 1, 1),
        scale: 1
      };
    }

    try {
      const box = new THREE.Box3().setFromObject(scene);

      if (box.isEmpty()) {
        return {
          center: new THREE.Vector3(0, 0, 0),
          size: new THREE.Vector3(1, 1, 1),
          scale: 1
        };
      }

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Calculate uniform scale to fit model in 2 unit cube
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 2;
      const scale = maxDimension > 0 ? targetSize / maxDimension : 1;

      return { center, size, scale };
    } catch (error) {
      console.error("Error calculating model bounds:", error);
      return {
        center: new THREE.Vector3(0, 0, 0),
        size: new THREE.Vector3(1, 1, 1),
        scale: 1
      };
    }
  }, [scene]);
};

// FIXED: Clean Dynamic Model Component
const DynamicModel = memo(({ modelUrl, fabricCanvasRef, selectedColor, isAR = false }: { modelUrl: string; fabricCanvasRef: React.RefObject<FabricCanvas | null>; selectedColor: string; isAR?: boolean }) => {
  const { scene } = useGLTF(modelUrl);
  const modelGroupRef = useRef<THREE.Group>(null!);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const materialRefs = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const [modelError, setModelError] = useState(false);

  // Calculate bounds for auto-scaling
  const { center, scale: autoScale } = useModelBounds(scene);

  // Determine final scale based on mode
  const finalScale = isAR ? GLOBAL_3D_CONFIG.arScale * autoScale : GLOBAL_3D_CONFIG.baseScale * autoScale;

  // Get all meshes from the loaded model
  const meshes = useMemo(() => {
    const meshArray: Array<{ mesh: THREE.Mesh; name: string; originalMaterial: THREE.Material | THREE.Material[] }> = [];

    if (!scene) {
      setModelError(true);
      return meshArray;
    }

    try {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshArray.push({
            mesh: child,
            name: child.name || `mesh-${meshArray.length}`,
            originalMaterial: child.material
          });
        }
      });

      if (meshArray.length === 0) {
        setModelError(true);
      } else {
        setModelError(false);
      }
    } catch (error) {
      console.error("Error processing model meshes:", error);
      setModelError(true);
    }
    return meshArray;
  }, [scene]);

  // Initialize materials for each mesh
  useEffect(() => {
    if (!meshes.length) return;

    try {
      // Clear previous materials
      materialRefs.current.clear();

      meshes.forEach(({ mesh, name, originalMaterial }) => {
        let material: THREE.MeshStandardMaterial;

        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          material = originalMaterial.clone();
        } else if (Array.isArray(originalMaterial)) {
          const firstMaterial = originalMaterial[0];
          if (firstMaterial instanceof THREE.MeshStandardMaterial) {
            material = firstMaterial.clone();
          } else {
            material = new THREE.MeshStandardMaterial();
          }
        } else {
          material = new THREE.MeshStandardMaterial();
        }

        // Set material properties
        material.side = isAR ? THREE.DoubleSide : THREE.FrontSide;
        material.depthTest = true;
        material.depthWrite = true;
        material.color = new THREE.Color("white");
        material.alphaTest = 0.1;
        material.needsUpdate = true;
        materialRefs.current.set(name, material);
      });
    } catch (error) {
      console.error("Error initializing materials:", error);
      setModelError(true);
    }
  }, [meshes, isAR]);

  // FIXED: Apply centering offset once when model loads
  useEffect(() => {
    if (modelGroupRef.current && center) {
      modelGroupRef.current.position.copy(center.clone().negate());
    }
  }, [center]);

  // Update texture from fabric canvas
  useFrame(() => {
    try {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      // Update canvas background color
      if (canvas.backgroundColor !== selectedColor) {
        canvas.backgroundColor = selectedColor;
        canvas.renderAll();
      }

      const fabricEl = canvas.lowerCanvasEl;
      if (!fabricEl) return;

      // Create or update texture
      if (!textureRef.current) {
        textureRef.current = new THREE.CanvasTexture(fabricEl);
        textureRef.current.flipY = true;
        textureRef.current.premultiplyAlpha = true;
        textureRef.current.wrapS = THREE.RepeatWrapping;
        textureRef.current.wrapT = THREE.RepeatWrapping;
        textureRef.current.anisotropy = 8;
        textureRef.current.minFilter = THREE.LinearMipMapLinearFilter;
        textureRef.current.magFilter = THREE.LinearFilter;
        textureRef.current.needsUpdate = true;
      } else {
        textureRef.current.needsUpdate = true;
      }

      // Apply texture to all materials
      materialRefs.current.forEach((material) => {
        if (textureRef.current) {
          material.map = textureRef.current;
          material.color = new THREE.Color("white");
          material.needsUpdate = true;
        }
      });
    } catch (error) {
      console.error("Error updating texture:", error);
    }
  });

  // Force initial texture application
  useEffect(() => {
    const applyInitialTexture = () => {
      try {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        if (canvas.backgroundColor !== selectedColor) {
          canvas.backgroundColor = selectedColor;
          canvas.renderAll();
        }

        const fabricEl = canvas.lowerCanvasEl;
        if (!fabricEl) return;

        const initialTexture = new THREE.CanvasTexture(fabricEl);
        initialTexture.flipY = true;
        initialTexture.premultiplyAlpha = true;
        initialTexture.wrapS = THREE.RepeatWrapping;
        initialTexture.wrapT = THREE.RepeatWrapping;
        initialTexture.needsUpdate = true;
        textureRef.current = initialTexture;

        materialRefs.current.forEach((material) => {
          material.map = initialTexture;
          material.color = new THREE.Color("white");
          material.needsUpdate = true;
        });
      } catch (error) {
        console.error("Error applying initial texture:", error);
      }
    };

    if (materialRefs.current.size > 0 && fabricCanvasRef.current) {
      const timeoutId = setTimeout(applyInitialTexture, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [meshes, selectedColor, fabricCanvasRef]);

  // Handle selectedColor changes immediately
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas && canvas.backgroundColor !== selectedColor) {
      canvas.backgroundColor = selectedColor;
      canvas.renderAll();
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
    }
  }, [selectedColor, fabricCanvasRef]);

  if (modelError || meshes.length === 0) {
    return (
      <group position={GLOBAL_3D_CONFIG.worldPosition} rotation={GLOBAL_3D_CONFIG.worldRotation}>
        <Box args={[1, 1.5, 0.1]}>
          <meshStandardMaterial color='#ff4444' transparent opacity={0.5} />
        </Box>
        <Text fontSize={0.1} color='red' anchorX='center' anchorY='middle' position={[0, 0, 0.1]}>
          Model Error
        </Text>
      </group>
    );
  }

  // FIXED: Simple structure - world position + centering offset + scale
  return (
    <group position={GLOBAL_3D_CONFIG.worldPosition} rotation={GLOBAL_3D_CONFIG.worldRotation}>
      <group ref={modelGroupRef}>
        {meshes.map(({ mesh, name }, index) => (
          <mesh key={`${name}-${index}`} geometry={mesh.geometry} material={materialRefs.current.get(name)} castShadow receiveShadow>
            <meshStandardMaterial color={selectedColor} />
          </mesh>
        ))}
      </group>
    </group>
  );
});

// FIXED: Interactive Model Component for AR
const InteractiveARModel = memo(({ modelUrl, fabricCanvasRef, selectedColor }: { modelUrl: string; fabricCanvasRef: React.RefObject<FabricCanvas | null>; selectedColor: string }) => {
  const { scene } = useGLTF(modelUrl);
  const modelGroupRef = useRef<THREE.Group>(null!);
  const interactionGroupRef = useRef<THREE.Group>(null!);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const materialRefs = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const { gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef(new THREE.Vector2());
  const currentRotation = useRef(new THREE.Euler(0, 0, 0));

  // Calculate bounds for auto-scaling
  const { center, scale: autoScale } = useModelBounds(scene);
  const finalScale = GLOBAL_3D_CONFIG.arScale * autoScale;

  // Get all meshes from the loaded model
  const meshes = useMemo(() => {
    const meshArray: Array<{ mesh: THREE.Mesh; name: string; originalMaterial: THREE.Material | THREE.Material[] }> = [];

    if (!scene) return meshArray;

    try {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshArray.push({
            mesh: child,
            name: child.name || `mesh-${meshArray.length}`,
            originalMaterial: child.material
          });
        }
      });
    } catch (error) {
      console.error("Error processing AR model meshes:", error);
    }
    return meshArray;
  }, [scene]);

  // Initialize materials for each mesh
  useEffect(() => {
    if (!meshes.length) return;

    try {
      materialRefs.current.clear();

      meshes.forEach(({ mesh, name, originalMaterial }) => {
        let material: THREE.MeshStandardMaterial;

        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          material = originalMaterial.clone();
        } else if (Array.isArray(originalMaterial)) {
          const firstMaterial = originalMaterial[0];
          if (firstMaterial instanceof THREE.MeshStandardMaterial) {
            material = firstMaterial.clone();
          } else {
            material = new THREE.MeshStandardMaterial();
          }
        } else {
          material = new THREE.MeshStandardMaterial();
        }

        // Set material properties for AR
        material.side = THREE.DoubleSide;
        material.depthTest = true;
        material.depthWrite = true;
        material.color = new THREE.Color("white");
        material.alphaTest = 0.1;
        material.needsUpdate = true;
        materialRefs.current.set(name, material);
      });
    } catch (error) {
      console.error("Error initializing AR materials:", error);
    }
  }, [meshes]);

  // Apply centering offset
  useEffect(() => {
    if (modelGroupRef.current && center) {
      modelGroupRef.current.position.copy(center.clone().negate());
    }
  }, [center]);

  // Update texture from fabric canvas
  useFrame(() => {
    try {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      if (canvas.backgroundColor !== selectedColor) {
        canvas.backgroundColor = selectedColor;
        canvas.renderAll();
      }

      const fabricEl = canvas.lowerCanvasEl;
      if (!fabricEl) return;

      if (!textureRef.current) {
        textureRef.current = new THREE.CanvasTexture(fabricEl);
        textureRef.current.flipY = true;
        textureRef.current.premultiplyAlpha = true;
        textureRef.current.wrapS = THREE.RepeatWrapping;
        textureRef.current.wrapT = THREE.RepeatWrapping;
        textureRef.current.needsUpdate = true;
      } else {
        textureRef.current.needsUpdate = true;
      }

      materialRefs.current.forEach((material) => {
        if (textureRef.current) {
          material.map = textureRef.current;
          material.color = new THREE.Color("white");
          material.needsUpdate = true;
        }
      });
    } catch (error) {
      console.error("Error updating AR texture:", error);
    }
  });

  // Handle touch interactions
  useEffect(() => {
    const canvas = gl.domElement;
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        setIsDragging(true);
        startPosition.current.set(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isDragging) {
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - startPosition.current.x;
        const deltaY = touch.clientY - startPosition.current.y;

        currentRotation.current.y += deltaX * 0.01;
        currentRotation.current.x += deltaY * 0.01;

        if (interactionGroupRef.current) {
          interactionGroupRef.current.rotation.x = currentRotation.current.x;
          interactionGroupRef.current.rotation.y = currentRotation.current.y;
        }

        startPosition.current.set(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gl, isDragging]);

  if (meshes.length === 0) {
    return null;
  }

  return (
    <group position={GLOBAL_3D_CONFIG.worldPosition} rotation={GLOBAL_3D_CONFIG.worldRotation} scale={finalScale}>
      <group ref={interactionGroupRef}>
        <group ref={modelGroupRef}>
          {meshes.map(({ mesh, name }, index) => (
            <mesh key={`ar-${name}-${index}`} geometry={mesh.geometry} material={materialRefs.current.get(name)} castShadow receiveShadow />
          ))}
        </group>
      </group>
    </group>
  );
});

// AR Mode Component
const ARMode = memo(({ modelUrl, fabricCanvasRef, selectedColor, onExitAR }: { modelUrl: string; fabricCanvasRef: React.RefObject<FabricCanvas | null>; selectedColor: string; onExitAR: () => void }) => {
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [visible, setVisible] = useState(false);
  const [place3D, setPlace3D] = useState(true);
  const [startAR, setStartAR] = useState(false);

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const handleExitAR = useCallback(() => {
    setStartAR(false);
    setVisible(false);
    onExitAR();
  }, [onExitAR]);

  useEffect(() => {
    return () => {
      setStartAR(false);
      setVisible(false);
    };
  }, []);

  return (
    <div className='fixed inset-0 z-50 w-full h-full flex flex-col items-center justify-center bg-black'>
      {!startAR && (
        <div className='absolute inset-0 flex items-center justify-center z-50 bg-black/80'>
          <div className='text-center text-white space-y-4'>
            <h2 className='text-2xl font-bold'>AR Mode</h2>
            <p className='text-sm opacity-80'>Arahkan kamera ke target image untuk melihat model 3D</p>
            <Button onClick={() => setStartAR(true)} className='px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'>
              <Camera className='w-5 h-5 mr-2' />
              Mulai AR
            </Button>
          </div>
        </div>
      )}

      <Canvas className='w-full h-full' shadows gl={{ antialias: false }}>
        <Html fullscreen className='relative pointer-events-none'>
          <div className='absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto'>
            <Button onClick={handleExitAR} variant='outline' className='bg-black/50 backdrop-blur-sm text-white border-white/30 hover:bg-black/20 hover:text-white/50'>
              <X className='w-4 h-4 mr-2' />
              Exit AR
            </Button>
            {startAR && (
              <Button onClick={toggleCamera} variant='outline' className='bg-black/50 backdrop-blur-sm text-white border-white/30 hover:bg-black/20 hover:text-white/50'>
                <RotateCcw className='w-4 h-4 mr-2' />
                {isFrontCamera ? "Kamera Belakang" : "Kamera Depan"}
              </Button>
            )}
          </div>
          {startAR && (
            <div className='absolute left-1/2 bottom-16 -translate-x-1/2 -translate-y-1/2 pointer-events-auto border'>
              <Button variant='outline' onClick={() => setVisible((prev) => !prev)} className='bg-black/50 backdrop-blur-sm text-white border-white/30 hover:bg-black/20 hover:text-white/50 mr-2'>
                {visible ? "Hide" : "Show"} AR
              </Button>
              <Button variant='outline' onClick={() => setPlace3D((prev) => !prev)} className='bg-black/50 backdrop-blur-sm text-white border-white/30 hover:bg-black/20 hover:text-white/50'>
                {place3D ? "Place" : "Pick up"}
              </Button>
            </div>
          )}
          <div className='absolute bottom-4 left-4 right-4 text-center pointer-events-none'>
            <div className='bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white'>
              <p className='text-sm font-medium mb-1'>{visible ? "Model Terdeteksi!" : "Cari Target Image"}</p>
              <p className='text-xs opacity-80'>{visible ? "Gunakan jari untuk memutar model • Cubit untuk zoom" : "Arahkan kamera ke target image untuk melihat model 3D"}</p>
            </div>
          </div>
        </Html>

        <BrowserCompatibility />
        <GLContextInitializer />
        {startAR && <ZapparCamera userFacing={isFrontCamera} receiveShadow castShadow />}

        <Suspense fallback={null}>
          <Center>
            <InstantTracker placementMode={place3D}>
              <Suspense fallback={null}>
                <Center position={[0, 0, 0]}>
                  <group position={[0, 0, 0]} visible={visible} receiveShadow castShadow>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 10, 5]} intensity={1.2} />
                    <InteractiveARModel modelUrl={modelUrl} fabricCanvasRef={fabricCanvasRef} selectedColor={selectedColor} />
                  </group>
                </Center>
              </Suspense>
            </InstantTracker>
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
});

export default function ModelConfigurator() {
  const router = useRouter();
  const { data: getModel, isLoading, error } = useSWR<ModelData[]>("/api/admin/productKustom", fetcher);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const objectCounter = useRef(1);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedDecal, setSelectedDecal] = useState("#ffffff");
  const [textInput, setTextInput] = useState("");
  const [showUVGuide, setShowUVGuide] = useState(false);
  const [objects, setObjects] = useState<FabricObjectProps[]>([]);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const cameraControlsRef = useRef<CameraControls | null>(null!);
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [needsCanvasRestore, setNeedsCanvasRestore] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // AR Mode State
  const [isARMode, setIsARMode] = useState(false);
  const [isARSupported, setIsARSupported] = useState(true);

  // Ref untuk mengakses fungsi export dari Scene
  const sceneExportRef = useRef<{ exportModel: () => void } | null>(null);

  // FIXED: Model selection with proper cleanup and key generation
  const handleModelSelect = useCallback((model: ModelData) => {
    setSelectedModel(model);

    // Reset camera position when model changes
    setTimeout(() => {
      if (cameraControlsRef.current) {
        cameraControlsRef.current.setLookAt(0, 0.2, 3, 0, 0, 0, true);
      }
    }, 100);
  }, []);

  const handleExport3D = useCallback(() => {
    if (sceneExportRef.current) {
      sceneExportRef.current.exportModel();
    }
  }, []);

  // FIXED: Add key to force re-render when model changes
  const sceneProps = useMemo(
    () => ({
      modelUrl: selectedModel?.modelUrl,
      fabricCanvasRef,
      cameraControlsRef,
      selectedColor,
      exportRef: sceneExportRef
    }),
    [selectedModel, selectedColor]
  );

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsARSupported(false);
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setIsARSupported(true);
      } catch (error) {
        console.warn("AR not supported:", error);
        setIsARSupported(false);
      }
    };
    checkARSupport();
  }, []);

  // AR Mode handlers
  const handleEnterAR = useCallback(() => {
    if (!selectedModel) {
      toast.error("Please select a model first before entering AR mode.");
      return;
    }
    if (!isARSupported) {
      toast.error("AR tidak didukung pada perangkat ini. Pastikan menggunakan HTTPS dan izinkan akses kamera.");
      return;
    }
    setNeedsCanvasRestore(true);
    setIsARMode(true);
  }, [isARSupported, selectedModel]);

  const handleExitAR = useCallback(() => {
    setIsARMode(false);
    setTimeout(() => {
      setNeedsCanvasRestore(true);
    }, 100);
  }, []);

  // Reset local values when selected object changes
  useEffect(() => {
    if (selectedObject) {
      setLocalValues({
        opacity: selectedObject.opacity || 1,
        width: (selectedObject as Rect).width || 100,
        height: (selectedObject as Rect).height || 100,
        radius: Math.round((selectedObject as FabricCircle).radius || 50),
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        fontSize: (selectedObject as FabricText).fontSize || 24,
        fill: (selectedObject.fill as string) || "#ffffff",
        text: (selectedObject as FabricText).text || "",
        fontFamily: (selectedObject as FabricText).fontFamily || "Arial"
      });
    } else {
      setLocalValues({});
    }
  }, [selectedObject]);

  // Load UV texture dynamically
  const loadUVTexture = useCallback(async (uvUrl?: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      const url = uvUrl || "/uv_texture.png";
      const image = await FabricImage.fromURL(url);
      image.set({
        left: 0,
        top: 0,

        selectable: false,
        evented: false,
        moveCursor: "default",
        hoverCursor: "default",
        flipY: true,
        opacity: 1,
        name: "uv-guide"
      });
      image._scaling = true;
      image.scaleToWidth(canvas.getWidth());
      image.scaleToHeight(canvas.getHeight());
      canvas.add(image);
      canvas.sendObjectToBack(image);
      canvas.renderAll();
    } catch (error) {
      console.error("Failed to load UV texture:", error);
    }
  }, []);

  // Memoized transparent image loader
  const loadTransparentWhiteImageURL = useCallback(async (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          if (r === 255 && g === 255 && b === 255) {
            data[i + 3] = 0;
          } else if (r === 0 && g === 0 && b === 0) {
            data[i] = data[i + 1] = data[i + 2] = 200;
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png", 1));
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // Memoized object creation function
  const addObject = useCallback(
    async (
      type: "rect" | "circle" | "text" | "image",
      options: {
        textValue?: string;
        imageFile?: File;
        imageURL?: string;
        fill?: string;
      } = {}
    ) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const isUVGuide = type === "image" && options.imageURL;
      const name = isUVGuide ? "uv-guide" : `${type}-${objectCounter.current++}`;
      let obj: FabricObject | undefined;

      switch (type) {
        case "rect":
          obj = new Rect({
            left: 200,
            top: 200,
            width: 100,
            height: 80,
            fill: options.fill || selectedDecal,
            originX: "center",
            originY: "center",
            name
          });
          break;
        case "circle":
          obj = new FabricCircle({
            left: 200,
            top: 200,
            radius: 50,
            fill: options.fill || selectedDecal,
            originX: "center",
            originY: "center",
            name
          });
          break;
        case "text":
          if (!options.textValue?.trim()) return;
          obj = new FabricText(options.textValue, {
            left: 200,
            top: 200,
            fontSize: CANVAS_CONFIG.defaultFontSize,
            fill: options.fill || selectedDecal,
            fontFamily: CANVAS_CONFIG.defaultFontFamily,
            originX: "center",
            originY: "center",
            name
          });
          setTextInput("");
          break;
        case "image":
          if (options.imageFile) {
            const reader = new FileReader();
            reader.onload = async () => {
              const imgUrl = reader.result as string;
              const image = await FabricImage.fromURL(imgUrl);
              image.set({
                originX: "center",
                originY: "center",
                left: 0,
                top: 0,
                name
              });

              image.scale(0.1);
              canvas.centerObject(image);
              canvas.setActiveObject(image);
              canvas.add(image);
              canvas.renderAll();
            };
            reader.readAsDataURL(options.imageFile);
            return;
          }
          if (options.imageURL) {
            const image = await FabricImage.fromURL(options.imageURL);
            image.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              moveCursor: "default",
              hoverCursor: "default",
              flipY: true,
              opacity: 1,
              name: "uv-guide"
            });
            image.scaleToWidth(canvas.getWidth());
            image.scaleToHeight(canvas.getHeight());
            canvas.add(image);
            canvas.sendObjectToBack(image);
            canvas.renderAll();
            return;
          }
          return;
      }

      if (obj) {
        canvas.add(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    },
    [selectedDecal]
  );

  const selectObjectOnCanvas = useCallback((objectName: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const targetObject = objects.find((obj) => obj.name === objectName);
    if (targetObject) {
      canvas.setActiveObject(targetObject);
      canvas.renderAll();
      setSelectedObject(targetObject);
    }
  }, []);

  const deleteObject = useCallback(
    (objectName: string) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const objects = canvas.getObjects();
      const targetObject = objects.find((obj) => obj.name === objectName);
      if (targetObject) {
        canvas.remove(targetObject);
        canvas.renderAll();
        if (selectedObject?.name === objectName) {
          setSelectedObject(null);
        }
      }
    },
    [selectedObject]
  );

  const updateObjectProperty = useCallback((objectName: string, property: string, value: any) => {
    try {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const objects = canvas.getObjects();
      const targetObject = objects.find((obj) => obj.name === objectName);
      if (targetObject) {
        targetObject.set(property, value);
        canvas.renderAll();
        const updatedObject = canvas.getObjects().find((obj) => obj.name === objectName);
        if (updatedObject) {
          setSelectedObject(updatedObject);
        }
      }
    } catch (error) {
      console.error("Error updating object property:", error);
    }
  }, []);

  const debouncedUpdateProperty = useMemo(
    () =>
      debounce((objectName: string, property: string, value: any) => {
        updateObjectProperty(objectName, property, value);
      }, 300),
    [updateObjectProperty]
  );

  const handleLocalValueChange = useCallback(
    (property: string, value: any) => {
      setLocalValues((prev) => ({ ...prev, [property]: value }));
      if (selectedObject?.name) {
        debouncedUpdateProperty(selectedObject.name, property, value);
      }
    },
    [selectedObject, debouncedUpdateProperty]
  );

  const handleImmediateUpdate = useCallback(
    (property: string, value: any) => {
      setLocalValues((prev) => ({ ...prev, [property]: value }));
      if (selectedObject?.name) {
        updateObjectProperty(selectedObject.name, property, value);
      }
    },
    [selectedObject, updateObjectProperty]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const canvasObjects = canvas.getObjects();
      const selectableObjects = canvasObjects.filter((obj) => obj.selectable && obj.name !== "uv-guide");

      if (draggedIndex >= selectableObjects.length || dropIndex >= selectableObjects.length) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const draggedObject = selectableObjects[draggedIndex];
      if (!draggedObject) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      if (draggedIndex < dropIndex) {
        canvas.bringObjectForward(draggedObject, true);
      } else {
        canvas.sendObjectBackwards(draggedObject, true);
      }

      canvas.renderAll();
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Memoized event handlers
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        addObject("image", { imageFile: file });
      }
    },
    [addObject]
  );

  const addUvTexture = useCallback(async () => {
    try {
      const url = await loadTransparentWhiteImageURL("/uv_texture.png");
      await addObject("image", { imageURL: url });
    } catch (err) {
      console.error("Failed to load UV:", err);
    }
  }, [loadTransparentWhiteImageURL, addObject]);

  const removeUvTexture = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const uvTexture = objects.find((obj) => !obj.selectable && !obj.evented);
    if (uvTexture) {
      canvas.remove(uvTexture);
      canvas.renderAll();
    }
  }, []);

  const toggleUVGuide = useCallback(() => {
    setShowUVGuide((prev) => {
      const newValue = !prev;
      if (newValue) {
        if (selectedModel?.uvUrl) {
          loadUVTexture(selectedModel.uvUrl);
        } else {
          addUvTexture();
        }
      } else {
        removeUvTexture();
      }
      return newValue;
    });
  }, [selectedModel?.uvUrl, loadUVTexture, addUvTexture, removeUvTexture]);

  const clearCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.renderAll();
    objectCounter.current = 1;
  }, []);

  const downloadDesign = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL({ format: "png", multiplier: 8 });
    const link = document.createElement("a");
    link.download = "design.png";
    link.href = url;
    link.click();
  }, []);

  const handleAddRect = useCallback(() => addObject("rect"), [addObject]);
  const handleAddCircle = useCallback(() => addObject("circle"), [addObject]);
  const handleAddText = useCallback(() => addObject("text", { textValue: textInput }), [addObject, textInput]);

  const rotateStore = useCreateStore();
  const colorsStore = useCreateStore();

  const colors = useControls(
    {
      colors: folder({
        elevation1: "#292D39",
        elevation2: "#181C20",
        elevation3: "#373C4B",
        accent1: "#0066DC",
        accent2: "#007BFF",
        accent3: "#3C93FF",
        highlight1: "#535760",
        highlight2: "#8C92A4",
        highlight3: "#FEFEFE",
        vivid1: "#ffcc00"
      })
    },
    { store: colorsStore }
  );

  useControls(
    {
      rotation: buttonGroup({
        label: "Preview",
        opts: {
          Depan: () => cameraControlsRef.current?.setLookAt(0, 0.2, 3, 0, 0, 0, true),
          Kanan: () => cameraControlsRef.current?.setLookAt(3, 0.2, 0, 0, 0, 0, true),
          Kiri: () => cameraControlsRef.current?.setLookAt(-3, 0.2, 0, 0, 0, 0, true),
          Belakang: () => cameraControlsRef.current?.setLookAt(0, 0.2, -3, 0, 0, 0, true)
        }
      })
    },
    { store: rotateStore }
  );

  const theme = { colors };

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const canvas = new FabricCanvas(canvasRef.current, { width, height });
    fabricCanvasRef.current = canvas;

    const defaultText = new FabricText("Your Design", {
      left: width / 2,
      top: height / 2,
      fontSize: CANVAS_CONFIG.defaultFontSize,
      fill: "#000000",
      fontFamily: CANVAS_CONFIG.defaultFontFamily,
      originX: "center",
      originY: "center",
      name: "text"
    });

    canvas.add(defaultText);
    canvas.renderAll();

    if (needsCanvasRestore) {
      setNeedsCanvasRestore(false);
    }
  }, [needsCanvasRestore]);

  // Track objects changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject || null);
    };

    const updateObjects = () => {
      const objects = canvas.getObjects();
      setObjects(objects);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    canvas.on("object:added", updateObjects);
    canvas.on("object:removed", updateObjects);
    canvas.on("object:modified", updateObjects);

    updateObjects();

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", () => setSelectedObject(null));
      canvas.off("object:added", updateObjects);
      canvas.off("object:removed", updateObjects);
      canvas.off("object:modified", updateObjects);
    };
  }, []);

  // Timer waktu loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  // Model selection buttons
  const modelsPresetButtons = useMemo(() => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center p-4'>
          <Loader2 className='w-6 h-6 animate-spin mr-2' />
          <span>Loading... {loadingTime} seconds</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className='text-red-400 p-4 text-center flex items-center justify-center'>
          <AlertCircle className='w-4 h-4 mr-2' />
          Error loading models
        </div>
      );
    }

    if (!getModel || getModel.length === 0) {
      return (
        <div className='text-white/60 p-4 text-center flex items-center justify-center'>
          <AlertCircle className='w-4 h-4 mr-2' />
          No models available
        </div>
      );
    }

    return getModel?.data?.products?.map((model) => (
      <div
        key={model.id}
        onClick={() =>
          handleModelSelect({
            id: model.id,
            name: model.name,
            photo: model.photo,
            uvUrl: model.uvUrl,
            modelUrl: model.modelUrl
          })
        }
        className={cn("cursor-pointer p-2 rounded-lg border transition-all", selectedModel?.id === model.id ? "border-blue-500 bg-blue-500/20" : "border-zinc-600 hover:border-zinc-500 hover:bg-zinc-700/50")}
      >
        <div className='text-white font-medium text-sm'>{model.name}</div>
        {model.photo && (
          <img
            className='w-20 h-20 rounded-lg mt-2 object-cover'
            src={model.photo || "/placeholder.svg?height=80&width=80"}
            alt={model.name}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=80&width=80";
            }}
          />
        )}
      </div>
    ));
  }, [isLoading, loadingTime, error, getModel, selectedModel, handleModelSelect]);

  const { user } = useUser();

  // Improved checkout handler
  const handleCheckout = useCallback(async () => {
    if (!selectedModel || !fabricCanvasRef.current) {
      toast.error("Please select a model and create a design first");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const fabricData = fabricCanvasRef.current.toJSON();
      const designImage = fabricCanvasRef.current.toDataURL({ format: "png", multiplier: 8 });

      const checkoutData = {
        customer: {
          userId: user?.id,
          name: "",
          email: "",
          phone: "",
          address: "",
          notes: ""
        },
        product: {
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          modelUrl: selectedModel.modelUrl,
          modelPhoto: selectedModel.photo,
          uvUrl: selectedModel.uvUrl
        },
        design: {
          fabricData: fabricData,
          designImage: designImage,
          backgroundColor: selectedColor,
          decalColor: selectedDecal,
          objects: objects
            .filter((obj) => obj.selectable && obj.name !== "uv-guide")
            .map((obj) => ({
              type: obj.type,
              name: obj.name,
              properties: {
                left: obj.left,
                top: obj.top,
                width: (obj as any).width,
                height: (obj as any).height,
                radius: (obj as any).radius,
                fill: obj.fill,
                fontSize: (obj as any).fontSize,
                text: (obj as any).text,
                fontFamily: (obj as any).fontFamily,
                opacity: obj.opacity
              }
            }))
        },
        metadata: {
          orderId: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          totalObjects: objects.filter((obj) => obj.selectable && obj.name !== "uv-guide").length,
          hasUVGuide: showUVGuide,
          canvasSize: {
            width: fabricCanvasRef.current.getWidth(),
            height: fabricCanvasRef.current.getHeight()
          }
        }
      };

      try {
        const checkoutDataString = JSON.stringify(checkoutData);
        localStorage.setItem("checkoutData", checkoutDataString);
        sessionStorage.setItem("checkoutData", checkoutDataString);
        router.push("/checkout");
        toast.success("Redirecting to checkout...");
        return;
      } catch (storageError) {
        console.warn("Storage failed:", storageError);
        toast.error("Unable to store checkout data. Please try again.");
      }
    } catch (error) {
      console.error("Checkout preparation error:", error);
      toast.error("Failed to prepare checkout data. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [selectedModel, fabricCanvasRef, selectedColor, selectedDecal, objects, showUVGuide, router, user]);

  return (
    <div className='h-full w-full flex'>
      <div className='min-w-fit p-4 overflow-y-auto'>
        <Card className='bg-zinc-900 text-white'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>Design Editor</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='w-96 h-96 rounded'>
              <canvas ref={canvasRef} className='block w-full h-full' />
            </div>

            <div className='flex w-full justify-center items-center gap-2'>
              <Input type='file' accept='image/*' ref={fileInputRef} onChange={handleImageUpload} className='hidden' />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className='w-4 h-4 mr-2' /> Upload Gambar
              </Button>
              <Button onClick={toggleUVGuide} variant='default' disabled={!selectedModel}>
                <Eye className='w-4 h-4 mr-2' /> UV Guide
              </Button>
            </div>

            <Separator />

            <div className='text-2xl max-w-96 border p-2 backdrop-blur-sm bg-zinc-700 rounded-md'>
              <Label className='text-lg font-semibold'>Select Model</Label>
              <div className='flex gap-2 max-w-96 overflow-auto p-2 backdrop-blur-sm bg-zinc-700 rounded-md max-h-48'>{modelsPresetButtons}</div>
              {selectedModel && (
                <div className='mt-2 p-2 bg-zinc-800 rounded text-sm'>
                  <div className='text-secondary-foreground'>Selected: {selectedModel.name}</div>
                </div>
              )}
              {!selectedModel && !isLoading && (
                <div className='mt-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded text-sm'>
                  <div className='text-yellow-400 flex items-center'>
                    <AlertCircle className='w-4 h-4 mr-2' />
                    Please select a model to continue
                  </div>
                </div>
              )}
            </div>

            <Label className='text-2xl'>Kustom Warna</Label>
            <div className='border flex max-w-96 gap-2 flex-col p-2 backdrop-blur-sm bg-zinc-700 rounded-md'>
              <Separator />
              <ColorPicker label='Warna Baju' value={selectedColor} onChange={setSelectedColor} />
              <Separator />
              <ColorPicker label='Warna Decal' value={selectedDecal} onChange={setSelectedDecal} />
              <Separator />
              <div className='grid grid-cols-2 gap-2'>
                <Button onClick={handleAddRect}>
                  <Square className='w-4 h-4 mr-1' /> Kotak
                </Button>
                <Button onClick={handleAddCircle}>
                  <Circle className='w-4 h-4 mr-1' /> Lingkaran
                </Button>
              </div>
              <Separator />
              <div className='flex gap-2'>
                <Input value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder='Tulis teks...' className='bg-zinc-800 border-zinc-600 text-white' />
                <Button onClick={handleAddText}>
                  <Type className='w-4 h-4' />
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <Button onClick={clearCanvas} variant='default'>
                Clear
              </Button>
              <Button onClick={downloadDesign} variant='default'>
                <Download className='w-4 h-4 mr-1' /> Download 2D
              </Button>
              <Button onClick={handleExport3D} variant='default' disabled={!selectedModel}>
                <Download className='w-4 h-4 mr-1' /> Download 3D
              </Button>
            </div>

            <Button onClick={handleCheckout} className='w-full' variant={"secondary"} disabled={!selectedModel || isCheckoutLoading}>
              {isCheckoutLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Preparing...
                </>
              ) : (
                <>
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  Pesan Sekarang
                </>
              )}
            </Button>

            <Button variant={"secondary"} onClick={handleEnterAR} className={`w-full ${isARSupported && selectedModel ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 cursor-not-allowed"}`} disabled={!isARSupported || !selectedModel}>
              <Camera className='w-4 h-4 mr-2' />
              {!selectedModel ? "Select Model First" : isARSupported ? "Enter AR Mode" : "AR Not Supported"}
            </Button>
            {!isARSupported && <p className='text-xs text-red-400 text-center'>AR memerlukan HTTPS dan izin akses kamera</p>}
          </CardContent>
        </Card>
      </div>

      <div className='overflow-clip p-20 w-full h-full'>
        {isARMode && selectedModel ? (
          <ARMode modelUrl={selectedModel.modelUrl} fabricCanvasRef={fabricCanvasRef} selectedColor={selectedColor} onExitAR={handleExitAR} />
        ) : (
          <View ref={viewRef} className='size-full box-border border-2 border-[#464444]'>
            <MemoizedScene {...sceneProps} />
          </View>
        )}
      </div>

      <div className='min-w-96 w-fit h-full p-4 gap-2 flex flex-col bg-zinc-950 overflow-y-auto'>
        <Card className='w-full text-white bg-zinc-900'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Palette className='w-5 h-5' /> Objects ({objects.filter((obj) => obj.selectable && obj.name !== "uv-guide").length})
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='w-full border min-h-32 max-h-48 bg-zinc-900 rounded-md p-2 overflow-y-auto'>
              {objects
                .filter((obj) => obj.selectable && obj.name !== "uv-guide")
                .map((obj, index) => (
                  <div
                    key={`${obj.name || "object"}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-2 mb-1 rounded cursor-move transition-colors ${
                      selectedObject?.name === obj.name ? "bg-blue-600/30 border border-blue-500" : dragOverIndex === index ? "bg-zinc-600 border border-zinc-500" : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                    onClick={() => selectObjectOnCanvas(obj.name || "")}
                  >
                    <div className='flex items-center gap-2'>
                      <GripVertical className='w-4 h-4 text-white/40' />
                      {obj.type === "rect" && <Square className='w-4 h-4' />}
                      {obj.type === "circle" && <Circle className='w-4 h-4' />}
                      {obj.type === "text" && <Type className='w-4 h-4' />}
                      {obj.type === "image" && <Upload className='w-4 h-4' />}
                      <span className='text-sm text-white/70'>{obj.name || `Object ${index + 1}`}</span>
                    </div>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20'
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteObject(obj.name || "");
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              {objects.filter((obj) => obj.selectable && obj.name !== "uv-guide").length === 0 && <div className='text-center text-white/50 py-4'>No objects yet</div>}
            </div>

            {selectedObject && (
              <div className='border border-zinc-700 rounded-md p-3 bg-zinc-800/50'>
                <h3 className='text-sm font-medium mb-3 text-white'>Edit: {selectedObject.name}</h3>
                <div className='space-y-3'>
                  <div>
                    <Label className='text-xs text-white/80'>Color</Label>
                    <div className='flex gap-2 mt-1'>
                      <Input
                        type='color'
                        value={localValues.fill || "#ffffff"}
                        onChange={(e) => handleImmediateUpdate("fill", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className='w-12 h-8 px-1 py-0.5 border-current/20 bg-zinc-800 rounded'
                      />
                      <Input value={localValues.fill || "#ffffff"} onChange={(e) => handleImmediateUpdate("fill", e.target.value)} onClick={(e) => e.stopPropagation()} className='flex-1 text-xs bg-zinc-800 border-zinc-600 text-white' />
                    </div>
                  </div>

                  {selectedObject.type === "text" && (
                    <>
                      <div>
                        <Label className='text-xs text-white/80'>Font Size</Label>
                        <Input
                          type='number'
                          value={localValues.fontSize || 24}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 24;
                            handleLocalValueChange("fontSize", value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className='mt-1 text-xs bg-zinc-800 border-zinc-600 text-white'
                          min='8'
                          max='100'
                        />
                      </div>
                      <div>
                        <Label className='text-xs text-white/80'>Text Content</Label>
                        <Input
                          value={localValues.text || ""}
                          onChange={(e) => handleImmediateUpdate("text", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className='mt-1 text-xs bg-zinc-800 border-zinc-600 text-white'
                          placeholder='Enter text...'
                        />
                      </div>
                    </>
                  )}

                  {(selectedObject.type === "rect" || selectedObject.type === "circle") && (
                    <>
                      <div>
                        <Label className='text-xs text-white/80'>Opacity</Label>
                        <Input
                          type='range'
                          min='0'
                          max='1'
                          step='0.1'
                          value={localValues.opacity || 1}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value);
                            handleLocalValueChange("opacity", value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className='mt-1'
                        />
                        <span className='text-xs text-white/60'>{Math.round((localValues.opacity || 1) * 100)}%</span>
                      </div>

                      {selectedObject.type === "rect" && (
                        <>
                          <div>
                            <Label className='text-xs text-white/80'>Width</Label>
                            <Input
                              type='number'
                              value={localValues.width || 100}
                              onChange={(e) => {
                                const value = Number.parseInt(e.target.value) || 100;
                                handleLocalValueChange("width", value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className='mt-1 text-xs bg-zinc-800 border-zinc-600 text-white'
                              min='1'
                            />
                          </div>
                          <div>
                            <Label className='text-xs text-white/80'>Height</Label>
                            <Input
                              type='number'
                              value={localValues.height || 100}
                              onChange={(e) => {
                                const value = Number.parseInt(e.target.value) || 100;
                                handleLocalValueChange("height", value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className='mt-1 text-xs bg-zinc-800 border-zinc-600 text-white'
                              min='1'
                            />
                          </div>
                        </>
                      )}

                      {selectedObject.type === "circle" && (
                        <div>
                          <Label className='text-xs text-white/80'>Radius</Label>
                          <Input
                            type='number'
                            value={localValues.radius || 50}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value) || 50;
                              handleLocalValueChange("radius", value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className='mt-1 text-xs bg-zinc-800 border-zinc-600 text-white'
                            min='5'
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='w-full text-white bg-zinc-900'>
          <CardHeader>
            <CardTitle className='text-secondary'>Preview Controls</CardTitle>
            <CardDescription>Camera and scene controls</CardDescription>
          </CardHeader>
          <CardContent>
            <Leva theme={theme} />
            <LevaPanel fill flat titleBar={false} store={rotateStore} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// FIXED: Memoized Scene component without conflicting centering logic
const MemoizedScene = memo(function Scene({
  modelUrl,
  cameraControlsRef,
  exportRef,
  fabricCanvasRef,
  selectedColor
}: {
  modelUrl?: string;
  cameraControlsRef: React.Ref<CameraControls | null>;
  exportRef?: React.RefObject<{ exportModel: () => void } | null>;
  fabricCanvasRef: React.RefObject<FabricCanvas | null>;
  selectedColor: string;
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const { gl, scene, camera } = useThree();

  const exportModel = useCallback(() => {
    if (!gl || !scene || !camera) return;

    const originalPixelRatio = gl.getPixelRatio();
    const originalSize = gl.getSize(new THREE.Vector2());
    const originalAspect = camera.aspect;
    const canvas = gl.domElement;

    const exportWidth = canvas.clientWidth;
    const exportHeight = canvas.clientHeight;
    const exportAspect = exportWidth / exportHeight;

    gl.setPixelRatio(2);
    gl.setSize(exportWidth, exportHeight);
    camera.aspect = exportAspect;
    camera.updateProjectionMatrix();

    gl.render(scene, camera);
    const dataURL = canvas.toDataURL("image/png", 1);

    gl.setPixelRatio(originalPixelRatio);
    gl.setSize(originalSize.x, originalSize.y);
    camera.aspect = originalAspect;
    camera.updateProjectionMatrix();

    const link = document.createElement("a");
    link.download = "3d-model-export.png";
    link.href = dataURL;
    link.click();
  }, [gl, scene, camera]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useEffect(() => {
    if (exportRef) {
      exportRef.current = { exportModel };
    }
  }, [exportModel, exportRef]);

  return (
    <>
      <Suspense fallback={<LoadingText />}>
        <color args={["#1e1e1e"]} attach={"background"} />
        <PerspectiveCamera ref={cameraRef} makeDefault fov={45} position={[0, 0.2, 3]} />
        <CameraControls ref={cameraControlsRef} makeDefault />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <ContactShadows position={[0, -0.59, 0]} opacity={1} scale={20} blur={1} far={6} resolution={256} color={"#000000"} />
        <Lighting />
        <Ground />

        {/* FIXED: Simple structure without conflicting centering logic */}
        <Resize height precise>
          {modelUrl ? (
            <DynamicModel
              key={modelUrl} // Force re-render when model changes
              modelUrl={modelUrl}
              fabricCanvasRef={fabricCanvasRef}
              selectedColor={selectedColor}
              isAR={false}
            />
          ) : (
            <ModelPlaceholder />
          )}
        </Resize>
      </Suspense>
    </>
  );
});

function Ground() {
  const gridConfig = {
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: "#6f6f6f",
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: "#00FF22",
    fadeDistance: 30,
    fadeStrength: 10,
    followCamera: false,
    infiniteGrid: true
  };
  return <Grid position={[0, -0.58, 0]} args={[10.5, 10.5]} {...gridConfig} />;
}

// Memoized loading component
const LoadingText = memo(function LoadingText() {
  return (
    <Text fontSize={0.5} color='white' anchorX='center' anchorY='middle'>
      Loading 3D Model...
    </Text>
  );
});

// Set display names
ColorPicker.displayName = "ColorPicker";
DynamicModel.displayName = "DynamicModel";
InteractiveARModel.displayName = "InteractiveARModel";
ARMode.displayName = "ARMode";
ModelPlaceholder.displayName = "ModelPlaceholder";
