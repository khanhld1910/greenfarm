export interface SingleBill {
    id: string,
    totalBillID: string,
    userID: string,
    productID: string,
    productName: string,
    unitPrice: number,
    quantity: number,
    productID_userID?: string,
}

export interface TotalBill {
    id: string,
    status: number,
    // 1: sent - da gui hoa don
    // 2: checked - da xu ly (da nhan hoa don)
    // 3: done - hoan thanh (da giao hang)
    userID: string,
    sentTime: string,
    deliverTime: string,
    address: string,
    name?: string,
    phone?: string,
    productName: string[],
    morningDeliver?: boolean,
    saved: number,
    ship: number,
    cost: number
}

export interface AddressInfo {
    id: string,
    name: string,
    phone: string,
    address: string
}


