export interface SingleBill {
    id: string,
    status: number,
    // 1: unchecked - chua xu ly (da gui hoa don)
    // 2: checked - da xu ly (da nhan hoa don)
    // 3: done - hoan thanh (da giao hang)
    userID: string,
    productName: string,
    unitPrice: number,
    quantity: number,
    cost: number
}

export interface CombineBill {
    id: string,
    status: number,
    // 1: unchecked - chua xu ly (da gui hoa don)
    // 2: checked - da xu ly (da nhan hoa don)
    // 3: done - hoan thanh (da giao hang)
    userID: string,
    productName: string,
    unitPrice: number,
    quantity: number,
    cost: number
}