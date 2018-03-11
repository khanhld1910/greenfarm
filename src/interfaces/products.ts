export interface Product {
    id: string,
    name: string,
    unitPrice: number,
    image: string,
    describe?: string,
    ratings?: [{value: number}]
    amount: number,
    saleOff?: boolean,
    oldPrice?: number,  
}


