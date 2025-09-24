// Express Route Handlers with Forestry
import express, { Request, Response } from 'express';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Product state interface
interface ProductState {
  products: Product[];
  categories: Category[];
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  productCount: number;
}

// Validation schemas
const ProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  inStock: z.boolean(),
  tags: z.array(z.string()),
});

const ProductStateSchema = z.object({
  products: z.array(ProductSchema),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    productCount: z.number(),
  })),
  filters: z.object({
    category: z.string(),
    minPrice: z.number().min(0),
    maxPrice: z.number().min(0),
    search: z.string(),
  }),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    total: z.number().min(0),
  }),
});

// Global product store (in real app, this might be per-user or cached)
class ProductStore extends Forest<ProductState> {
  constructor() {
    super({
      name: 'product-store',
      value: {
        products: [
          {
            id: 1,
            name: 'Laptop',
            description: 'High-performance laptop for developers',
            price: 1299.99,
            category: 'electronics',
            inStock: true,
            tags: ['computer', 'work', 'portable'],
          },
          {
            id: 2,
            name: 'Coffee Mug',
            description: 'Perfect mug for your morning coffee',
            price: 12.99,
            category: 'home',
            inStock: true,
            tags: ['kitchen', 'coffee', 'ceramic'],
          },
          {
            id: 3,
            name: 'Wireless Headphones',
            description: 'Noise-cancelling wireless headphones',
            price: 199.99,
            category: 'electronics',
            inStock: false,
            tags: ['audio', 'wireless', 'music'],
          },
        ],
        categories: [
          { id: 'electronics', name: 'Electronics', productCount: 2 },
          { id: 'home', name: 'Home & Garden', productCount: 1 },
        ],
        filters: {
          category: '',
          minPrice: 0,
          maxPrice: 10000,
          search: '',
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
        },
      },
      schema: ProductStateSchema,
    });
  }

  // Actions
  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: Math.max(...this.value.products.map(p => p.id), 0) + 1,
    };

    this.mutate(draft => {
      draft.products.push(newProduct);
      draft.pagination.total += 1;
      
      // Update category count
      const category = draft.categories.find(c => c.id === product.category);
      if (category) {
        category.productCount += 1;
      }
    });

    return newProduct;
  }

  updateProduct(id: number, updates: Partial<Product>): Product | null {
    const productIndex = this.value.products.findIndex(p => p.id === id);
    if (productIndex === -1) return null;

    this.mutate(draft => {
      Object.assign(draft.products[productIndex], updates);
    });

    return this.value.products[productIndex];
  }

  deleteProduct(id: number): boolean {
    const productIndex = this.value.products.findIndex(p => p.id === id);
    if (productIndex === -1) return false;

    const product = this.value.products[productIndex];

    this.mutate(draft => {
      draft.products.splice(productIndex, 1);
      draft.pagination.total -= 1;
      
      // Update category count
      const category = draft.categories.find(c => c.id === product.category);
      if (category) {
        category.productCount -= 1;
      }
    });

    return true;
  }

  setFilters(filters: Partial<ProductState['filters']>): void {
    this.mutate(draft => {
      Object.assign(draft.filters, filters);
      draft.pagination.page = 1; // Reset to first page when filtering
    });
  }

  setPagination(pagination: Partial<ProductState['pagination']>): void {
    this.mutate(draft => {
      Object.assign(draft.pagination, pagination);
    });
  }

  // Getters
  get filteredProducts(): Product[] {
    const { filters } = this.value;
    return this.value.products.filter(product => {
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const matchesSearch = !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }

  get paginatedProducts(): Product[] {
    const filtered = this.filteredProducts;
    const { page, limit } = this.value.pagination;
    const startIndex = (page - 1) * limit;
    return filtered.slice(startIndex, startIndex + limit);
  }
}

// Create global store instance
const productStore = new ProductStore();

// Route handlers
const router = express.Router();

// GET /api/products - List products with filtering and pagination
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, minPrice, maxPrice, search, page, limit } = req.query;

    // Update filters
    if (category || minPrice || maxPrice || search) {
      productStore.setFilters({
        category: category as string || '',
        minPrice: minPrice ? parseFloat(minPrice as string) : 0,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : 10000,
        search: search as string || '',
      });
    }

    // Update pagination
    if (page || limit) {
      productStore.setPagination({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
    }

    const products = productStore.paginatedProducts;
    const total = productStore.filteredProducts.length;

    res.json({
      products,
      pagination: {
        ...productStore.value.pagination,
        total,
        totalPages: Math.ceil(total / productStore.value.pagination.limit),
      },
      filters: productStore.value.filters,
      categories: productStore.value.categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const product = productStore.value.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create new product
router.post('/products', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const productData = ProductSchema.omit({ id: true }).parse(req.body);
    
    const newProduct = productStore.addProduct(productData);
    
    res.status(201).json({ 
      product: newProduct,
      message: 'Product created successfully' 
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validate partial update data
    const updateData = ProductSchema.partial().parse(req.body);
    
    const updatedProduct = productStore.updateProduct(id, updateData);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ 
      product: updatedProduct,
      message: 'Product updated successfully' 
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = productStore.deleteProduct(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories - Get all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    res.json({ categories: productStore.value.categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
