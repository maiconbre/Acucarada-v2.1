import { useState } from "react";
import { FlavorData } from "./ProductFormModal";
import { Label } from "@/components/ui/forms/label";
import { Badge } from "@/components/ui/data-display/badge";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/data-display/button";
import { Card } from "@/components/ui/data-display/card";
import { Textarea } from "@/components/ui/forms/textarea";
import { ImageUpload } from "@/components/ui/data-display/image-upload";
import { Plus, Trash2 } from "lucide-react";

interface ProductFlavorManagerProps {
    flavors: FlavorData[];
    setFlavors: (flavors: FlavorData[]) => void;
}

export const ProductFlavorManager = ({ flavors, setFlavors }: ProductFlavorManagerProps) => {
    const [newFlavorName, setNewFlavorName] = useState("");

    const addFlavor = () => {
        if (newFlavorName.trim() && !flavors.some(f => f.name.toLowerCase() === newFlavorName.toLowerCase())) {
            const newFlavor = {
                id: `flavor-${Date.now()}`,
                name: newFlavorName.trim(),
                image: "",
                description: ""
            };
            setFlavors([...flavors, newFlavor]);
            setNewFlavorName("");
        }
    };

    const removeFlavor = (id: string) => {
        setFlavors(flavors.filter(f => f.id !== id));
    };

    const updateFlavorImage = (id: string, imageUrl: string) => {
        setFlavors(flavors.map(f => f.id === id ? { ...f, image: imageUrl } : f));
    };

    const updateFlavorDescription = (id: string, description: string) => {
        setFlavors(flavors.map(f => f.id === id ? { ...f, description: description } : f));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Sabores disponíveis</Label>
                <Badge variant="secondary" className="text-xs">
                    {flavors.length} {flavors.length === 1 ? 'sabor' : 'sabores'}
                </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    placeholder="Nome do sabor (ex: chocolate, morango)"
                    value={newFlavorName}
                    onChange={(e) => setNewFlavorName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                    className="flex-1"
                />
                <Button
                    type="button"
                    onClick={addFlavor}
                    disabled={!newFlavorName.trim()}
                    size="sm"
                    className="px-4 w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:hidden">Adicionar Sabor</span>
                </Button>
            </div>

            {flavors.length > 0 && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {flavors.map((flavor) => (
                        <Card key={`flavor-${flavor.id}`} className="p-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-medium">
                                            {flavor.name}
                                        </Badge>
                                        {flavor.image && <Badge variant="secondary" className="text-xs">📷</Badge>}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFlavor(flavor.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Descrição do sabor (opcional)</Label>
                                    <Textarea
                                        placeholder={`Descrição detalhada para o sabor ${flavor.name}...`}
                                        value={flavor.description}
                                        onChange={(e) => updateFlavorDescription(flavor.id, e.target.value)}
                                        rows={2}
                                        className="text-sm resize-none"
                                    />
                                </div>

                                <div className="pt-2 border-t">
                                    <Label className="text-xs mb-2 block">Imagem do sabor (opcional)</Label>
                                    <ImageUpload
                                        value={flavor.image}
                                        onChange={(url) => updateFlavorImage(flavor.id, url)}
                                        bucketName="product-images"
                                        folder="products/flavors"
                                        showPreview={true}
                                        showMetadata={false}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
