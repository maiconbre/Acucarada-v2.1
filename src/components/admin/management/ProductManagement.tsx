import { List, Grid3X3, Eye, EyeOff, Edit, Trash2, Plus } from "lucide-react";
import { useAdminProducts } from "@/core/application/hooks/useAdminProducts";
import { ProductFormModal } from "./products/ProductFormModal";
import { Button } from "@/components/ui/data-display/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/data-display/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-display/table";
import { Badge } from "@/components/ui/data-display/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlays/dialog";

export const ProductManagement = () => {
  const {
    products,
    categories,
    loading,
    actionLoading,
    isOpen,
    setIsOpen,
    editingProduct,
    setEditingProduct,
    viewMode,
    setViewMode,
    confirmDialog,
    setConfirmDialog,
    handleEdit,
    handleConfirmAction,
    openConfirmDialog,
    handleSaveProduct,
  } = useAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">Gerencie o seu catálogo de produtos.</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => { setEditingProduct(null); setIsOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Produto
          </Button>
          <ProductFormModal
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            product={editingProduct}
            categories={categories}
            loading={loading}
            onSave={handleSaveProduct}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                {products.length} produtos cadastrados
              </CardDescription>
            </div>
            {/* Botão toggle para modo de visualização - apenas mobile */}
            <div className="flex sm:hidden items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {viewMode === 'list' ? (
              /* Mobile List Layout */
              <div className="space-y-3 p-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-3 mobile-card-hover mobile-ripple">
                    <div className="flex items-center space-x-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                          width="80"
                          height="80"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <h3 className="font-medium text-sm leading-tight mb-1">{product.name}</h3>
                            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                            <p className="text-sm font-semibold text-primary">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              Pronta entrega
                            </Badge>
                          )}
                          <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs px-2 py-0.5">
                            {product.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog('toggle', product)}
                            className="h-8 w-8 p-0 mobile-touch-target"
                            disabled={actionLoading === product.id}
                          >
                            {actionLoading === product.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            ) : product.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0 mobile-touch-target"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog('soft_delete', product)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0 mobile-touch-target"
                            disabled={actionLoading === product.id}
                          >
                            {actionLoading === product.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Mobile Grid Layout */
              <div className="grid grid-cols-2 gap-3 p-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-3 mobile-card-hover mobile-ripple">
                    <div className="space-y-2">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-24 rounded-lg object-cover"
                          width="120"
                          height="96"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="space-y-1">
                        <h3 className="font-medium text-xs leading-tight line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                        {product.is_on_promotion && product.promotional_price ? (
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-500 line-through">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                            <p className="text-sm font-semibold text-green-600">R$ {product.promotional_price.toFixed(2).replace(".", ",")}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-primary">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
                        {product.is_on_promotion && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5 bg-red-500">
                            Promoção
                          </Badge>
                        )}
                        {product.is_featured && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            Pronta entrega
                          </Badge>
                        )}
                        <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs px-1.5 py-0.5">
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      {/* Compact Action Buttons */}
                      <div className="flex items-center justify-between gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('toggle', product)}
                          className="h-7 w-7 p-0 mobile-touch-target"
                          disabled={actionLoading === product.id}
                        >
                          {actionLoading === product.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                          ) : product.is_active ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="h-7 w-7 p-0 mobile-touch-target"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('soft_delete', product)}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0 mobile-touch-target"
                          disabled={actionLoading === product.id}
                        >
                          {actionLoading === product.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Promoção</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                            width="40"
                            height="40"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Pronta entrega
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {product.is_on_promotion && product.promotional_price ? (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 line-through">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </div>
                          <div className="font-semibold text-green-600">
                            R$ {product.promotional_price.toFixed(2).replace(".", ",")}
                          </div>
                        </div>
                      ) : (
                        <div>R$ {product.price.toFixed(2).replace(".", ",")}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.is_on_promotion ? (
                        <Badge variant="destructive" className="bg-red-500">
                          Promoção
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('toggle', product)}
                          disabled={actionLoading === product.id}
                        >
                          {actionLoading === product.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                          ) : product.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('soft_delete', product)}
                          className="text-destructive hover:text-destructive"
                          disabled={actionLoading === product.id}
                        >
                          {actionLoading === product.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, type: 'toggle', product: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'soft_delete' ? (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Mover para Lixeira
                </>
              ) : confirmDialog.type === 'hard_delete' ? (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Excluir Produto Permanentemente
                </>
              ) : (
                <>
                  {confirmDialog.product?.is_active ? (
                    <>
                      <EyeOff className="h-5 w-5 text-orange-500" />
                      Ocultar Produto
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 text-green-500" />
                      Mostrar Produto
                    </>
                  )}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {confirmDialog.product && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <img
                  src={confirmDialog.product.image_url || "/placeholder.svg"}
                  alt={confirmDialog.product.name}
                  className="h-12 w-12 rounded-md object-cover"
                  width="48"
                  height="48"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <p className="font-medium">{confirmDialog.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {confirmDialog.product.category}
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {confirmDialog.type === 'soft_delete' ? (
                "O produto será movido para a lixeira e removido do painel admin. Os dados podem ser recuperados via banco de dados se necessário! 🗑️"
              ) : confirmDialog.type === 'hard_delete' ? (
                "Esta ação não pode ser desfeita. O produto será permanentemente removido do catálogo e todos os dados relacionados serão excluídos."
              ) : confirmDialog.product?.is_active ? (
                "O produto será ocultado do catálogo público, mas continuará visível no painel admin."
              ) : (
                "O produto será exibido no catálogo público e ficará visível para os clientes."
              )}
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ isOpen: false, type: 'toggle', product: null })}
            >
              Cancelar
            </Button>
            <Button
              variant={confirmDialog.type === 'hard_delete' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              className={confirmDialog.type === 'toggle' && !confirmDialog.product?.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
              disabled={actionLoading !== null}
            >
              {actionLoading !== null ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              ) : null}
              {confirmDialog.type === 'soft_delete' ? (
                'Mover para Lixeira'
              ) : confirmDialog.type === 'hard_delete' ? (
                'Excluir Permanentemente'
              ) : confirmDialog.product?.is_active ? (
                'Ocultar'
              ) : (
                'Mostrar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};