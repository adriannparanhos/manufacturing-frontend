export interface RawMaterial {
    id: number; 
    name: string;
    stockQuantity: number; 
}

export interface ProductComposition {
    materialId: number;
    materialName: string;
    quantity: number;
}

export interface Product {
    id: number;
    name: string;
    salesValue: number;
    compositions: ProductComposition[]; 
}

export interface ProductionPlan {
    productName: string;
    quantityToProduce: number;
    unitValue: number;
    totalValue: number;
}