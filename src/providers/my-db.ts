import { Injectable } from '@angular/core'
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Product } from '../interfaces/products';
import { User } from '../interfaces/user';
import { SingleBill, TotalBill } from '../interfaces/bill';
import { CustomMessage } from '../interfaces/message';

@Injectable()
export class MyDbProvider {

  constructor(
    private afDB: AngularFireDatabase
  ) { }

  getProducts(searchQuery?: string): Observable<Product[]> {
    return this.afDB.list<Product>(
      'Products/',
      ref => ref.orderByChild('id')
    ).valueChanges()
  }

  getValidQuantity(productID: string): Observable<Product> {
    return this.afDB
      .object<Product>('Products/' + productID)
      .valueChanges()
  }

  getSaleProducts(): Observable<Product[]> {
    return this.afDB.list<Product>(
      'Products/',
      ref => ref.orderByChild('saleOff').equalTo(true)
    ).valueChanges()
  }

  getSearchedProducts(_query?: string): Observable<Product[]> {
    let query = _query.replace(/\b\w/g, l => l.toUpperCase())
    return this.afDB.list<Product>(
      'Products/',
      ref => ref.orderByChild('name').startAt(query).endAt(query + '\uf8ff')
    ).valueChanges()
  }

  userLogin(phone: string): Promise<void> {
    let userRef = this.afDB.object('Users/' + phone)
    return userRef.update({ phone: phone })
  }

  getUserInfo(phone: string): Observable<User> {
    return this.afDB.object<User>('Users/' + phone).valueChanges()
  }

  getFavoriteProductIDs(phone: string): Observable<{ id: string }[]> {
    let favoriteRef = this.afDB.list<{ id: string }>('Users/' + phone + '/favorite/')
    return favoriteRef.valueChanges()
  }

  setFavoriteProduct(phone: string, productID: string, setFavoriteTo: boolean): Promise<void> {
    let favoriteRef = this.afDB.list('Users/' + phone + '/favorite/')
    if (setFavoriteTo) {
      // add to favorite array
      return favoriteRef.update(productID, { id: productID })
    } else {
      // remove from favorite array
      return favoriteRef.remove(productID)
    }
  }

  newCartBill(bill: SingleBill): Promise<boolean> {

    let cartBillList = this.afDB.list('Invoices/cart/' + bill.userID)
    const newKey = cartBillList.push('new item').key
    bill.id = newKey
    let cartSingleBillRef = this.afDB.object('Invoices/cart/' + bill.userID + '/' + bill.id)
    return cartSingleBillRef.update(bill)
      .then(value => true)
      .catch(err => false)
  }

  userGetCartBills(phoneNumber: string): Observable<SingleBill[]> {
    return this.afDB.list<SingleBill>(
      'Invoices/cart/' + phoneNumber,
      ref => ref.orderByChild('quantity')
    ).valueChanges()
  }

  checkCartHadProduct(bill: SingleBill): Observable<SingleBill[]> {
    return this.afDB.list<SingleBill>(
      'Invoices/cart/' + bill.userID,
      ref => ref.orderByChild('productID').equalTo(bill.productID)
    ).valueChanges()
  }

  removeCardBill(bill: SingleBill) {
    return this.afDB
      .list<SingleBill>('Invoices/cart/' + bill.userID)
      .remove(bill.id)
  }

  updateProductAmount(productID: string, justHadBuy: number) {
    this.afDB
      .object<Product>('Products/' + productID)
      .valueChanges()
      .first()
      .subscribe(product => {
        let oldAmount = product.amount
        let newAmount = oldAmount - justHadBuy
        this.afDB.object<Product>('Products/' + productID).update({amount: newAmount})
      })
  }

  sentReqFromCart(bills: SingleBill[], phone: string, deliverTime: string, sentTime: string, totalCost: number, address: string) {
    let billList = this.afDB.list('Bills/' + phone + '/')
    const newKey = billList.push('new item').key

    let newBill: TotalBill = {
      deliverTime: deliverTime,
      sentTime: sentTime,
      id: newKey,
      status: 1,
      userID: phone,
      totalCost: totalCost,
      address: address
    }
    //------------>
    var sentBills = {}
    //------------->
    //------------->

    for (var i = 0; i < bills.length; i++) {
      bills[i].totalBillID = newKey

      sentBills[bills[i].id] = bills[i]
      //productUpdate
      this.updateProductAmount(bills[i].productID, bills[i].quantity)
    }

    return Observable
      .forkJoin(
        // create total bill
        this.afDB.object(`Bills/${phone}/${newKey}`).update(newBill),
        // create sent bills
        this.afDB.object('Invoices/sent/' + phone + '/').update(sentBills),
        // delete cart bills
        this.afDB.object('Invoices/cart/' + phone + '/').remove(),
        // update products amount
        // ------------------------------------------------>
      )

  }

  getFirst5Messages(phone: string): Observable<CustomMessage[]> {
    return this.afDB.list<CustomMessage>(
      'Messages/' + phone,
      ref => ref.limitToLast(5)
    ).valueChanges()
  }

  getAnother5Messages(phone: string, endAtTime: number): Observable<CustomMessage[]> {
    return this.afDB.list<CustomMessage>(
      'Messages/' + phone,
      ref => ref.orderByChild('time').endAt(endAtTime).limitToLast(5)
    ).valueChanges()
  }

  newMessage(phone: string, message: CustomMessage): Observable<boolean> {
    return new Observable(ob => {
      let messageRef = this.afDB.object('Messages/' + phone + '/' + message.time)

      messageRef.update(message)
        .then(() => ob.next(true))
        .catch(err => ob.next(false))
    })
  }

  updateUserInfo(user: User): Promise<void> {
    return this.afDB.object<User>('Users/' + user.phone).update(user)
  }

}
