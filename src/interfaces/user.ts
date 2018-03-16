export interface User {
    phone: string,
    name?: string,
    address?: string,
    deliverAddresses?: string[],
    isMale?: boolean,
    birthday?: string,
    favorite?: string[]
}