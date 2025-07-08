import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { extractFaceDescriptor } from "@/lib/faceApi";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";

interface Face {
  id: number;
  name: string;
  tag: string;
  notes?: string;
  imageUrl: string;
  createdAt: string;
}

export default function FaceGallery() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFace, setEditingFace] = useState<Face | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    tag: "thief",
    notes: "",
  });

  // Fetch faces
  const { data: faces = [], isLoading } = useQuery({
    queryKey: ["/api/faces", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/faces?search=${encodeURIComponent(searchQuery)}`
        : "/api/faces";
      const response = await fetch(url);
      return response.json();
    },
  });

  // Add face mutation
  const addFaceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/faces", {
        method: "POST",
        body: data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      resetForm();
      setIsAddModalOpen(false);
      toast({
        title: t('success'),
        description: t('faceAddedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete face mutation
  const deleteFaceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/faces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: t('success'),
        description: t('faceDeletedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast({
        title: t('error'),
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract face descriptor from image
      const img = new Image();
      img.src = imagePreview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const faceDescriptor = await extractFaceDescriptor(img);
      
      if (!faceDescriptor) {
        toast({
          title: t('error'),
          description: "No face detected in the image. Please upload a clear face photo.",
          variant: "destructive",
        });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("image", selectedImage);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("tag", formData.tag);
      formDataToSend.append("notes", formData.notes);
      formDataToSend.append("faceEmbedding", JSON.stringify(Array.from(faceDescriptor)));

      addFaceMutation.mutate(formDataToSend);
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", tag: "thief", notes: "" });
    setSelectedImage(null);
    setImagePreview("");
    setEditingFace(null);
  };

  const handleEdit = (face: Face) => {
    setEditingFace(face);
    setFormData({
      name: face.name,
      tag: face.tag,
      notes: face.notes || "",
    });
    setImagePreview(face.imageUrl);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this face?")) {
      deleteFaceMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen security-bg">
      <Navigation />
      <main className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold security-text-primary">
          {t('faceGallery')}
        </h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="security-accent-red hover:security-accent-red" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addFace')}
            </Button>
          </DialogTrigger>
          <DialogContent className="security-surface security-border">
            <DialogHeader>
              <DialogTitle className="security-text-primary">
                {editingFace ? t('editFace') : t('addFace')}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="security-text-primary">
                  Face Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="security-border"
                />
                {imagePreview && (
                  <div className="w-32 h-32 border security-border rounded overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="security-text-primary">
                  {t('name')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="security-border"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tag" className="security-text-primary">
                  {t('tag')}
                </Label>
                <Select
                  value={formData.tag}
                  onValueChange={(value) => setFormData({ ...formData, tag: value })}
                >
                  <SelectTrigger className="security-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thief">{t('thief')}</SelectItem>
                    <SelectItem value="watchlist">{t('watchlist')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="security-text-primary">
                  {t('notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="security-border"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="security-accent-red hover:security-accent-red"
                  disabled={addFaceMutation.isPending}
                >
                  {addFaceMutation.isPending ? t('loading') : t('save')}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  className="security-surface-secondary"
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder={t('searchFaces')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 security-border"
        />
      </div>

      {/* Faces Grid */}
      {isLoading ? (
        <div className="text-center security-text-secondary">
          {t('loading')}
        </div>
      ) : faces.length === 0 ? (
        <div className="text-center security-text-secondary">
          No faces found. Add some faces to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {faces.map((face: Face) => (
            <Card key={face.id} className="security-surface security-border">
              <CardHeader className="p-4">
                <div className="aspect-square rounded overflow-hidden mb-3">
                  <img
                    src={face.imageUrl}
                    alt={face.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg security-text-primary">
                    {face.name}
                  </CardTitle>
                  <Badge 
                    variant={face.tag === 'thief' ? 'destructive' : 'secondary'}
                    className={face.tag === 'thief' ? 'security-accent-red' : 'bg-orange-600'}
                  >
                    {face.tag.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {face.notes && (
                  <p className="text-sm security-text-secondary mb-3 line-clamp-2">
                    {face.notes}
                  </p>
                )}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(face)}
                    className="flex-1 security-border"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(face.id)}
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    disabled={deleteFaceMutation.isPending}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    {t('delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </main>
    </div>
  );
}
