export interface SingleBill {
    id: string,
    totalBillID: string,
    userID: string,
    productID: string,
    productName: string,
    unitPrice: number,
    quantity: number
}

export interface TotalBill {
    id: string,
    status: number,
    // 1: sent - da gui hoa don
    // 2: checked - da xu ly (da nhan hoa don)
    // 3: done - hoan thanh (da giao hang)
    userID: string,
    totalCost: number,
    sentTime: string,
    deliverTime: string,
    address: string,
    productName: string[]
}


