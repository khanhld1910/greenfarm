export interface SingleBill {
    id: string,
    status: number,
    // 0: in cart
    // 1: sent - da gui hoa don
    // 2: checked - da xu ly (da nhan hoa don)
    // 3: done - hoan thanh (da giao hang)
    userID: string,
    productID: string,
    productName: string,
    unitPrice: number,
    quantity: number,
    cost: number,
    deliverTime: string
}
