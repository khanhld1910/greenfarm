
export interface Product {
    id: string,
    name: string,
    unitPrice: number,
    salePrice?: number, 
    image: string,
    describe?: string,
    ratings?: [{value: number}]
    amount: number,
    saleOff?: boolean, 
    thumbnail?: string
}


