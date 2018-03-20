import { Injectable } from '@angular/core'
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Rx';
import { Product } from '../interfaces/products';
import { User } from '../interfaces/user';
import { SingleBill, TotalBill, AddressInfo } from '../interfaces/bill';
import { CustomMessage } from '../interfaces/message';
//import { FirebaseDatabase } from '@firebase/database-types';
import * as firebase from 'firebase'
import { Rating } from '../interfaces/rating';
import { AppsCfg } from '../interfaces/app';

@Injectable()
export class MyDbProvider {
  fdb: firebase.database.Database

  constructor(
    private afDB: AngularFireDatabase,
  ) {
    this.fdb = firebase.database()
  }

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

  getUserAddressInfoList(phone: string) {
    return this.afDB.list<AddressInfo>(`Users/${phone}/deliverAddresses/`).valueChanges()
  }

  setUserInfo(user: User): Promise<void> {
    //console.log (user)
    return this.afDB
      .object('Users/' + user.phone)
      .update(user)
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

    let cartBillList = this.afDB.list('Invoices/cart/')
    const newKey = cartBillList.push('new item').key
    bill.id = newKey
    let cartSingleBillRef = this.afDB.object('Invoices/cart/' + bill.id)
    return cartSingleBillRef.update(bill)
      .then(value => true)
      .catch(err => false)
  }

  userGetCartBills(phoneNumber: string): Observable<SingleBill[]> {
    return this.afDB.list<SingleBill>(
      'Invoices/cart/',
      ref => ref.orderByChild('userID').equalTo(phoneNumber)
    ).valueChanges()
  }

  checkCartHadProduct(bill: SingleBill): Observable<SingleBill[]> {
    return this.afDB.list<SingleBill>(
      'Invoices/cart/',
      ref => ref.orderByChild('productID_userID').equalTo(`${bill.productID}_${bill.userID}`)
    ).valueChanges().first()
  }

  removeCardBill(bill: SingleBill) {
    return this.afDB
      .list<SingleBill>('Invoices/cart/')
      .remove(bill.id)
  }

  updateProductAmoutAfterReturn(id: string, quantity: number) {
    return this.fdb
      .ref(`Products/${id}/amount`)
      .transaction(amount => {
        return amount + quantity
      })
  }

  getBillsInTotalBill(invoice: TotalBill) {
    return this.afDB
      .list<SingleBill>(
        `Invoices/sent/`,
        ref => ref.orderByChild('totalBillID').equalTo(invoice.id)
      )
      .valueChanges()
  }

  async removeInvoice(invoice: TotalBill) {

    this.afDB
      .list<TotalBill>(`Bills/`)
      .remove(invoice.id)

    this.getBillsInTotalBill(invoice)
      .first()
      .subscribe(singleBills => {
        let removeSentBills = {}
        let updateProducts = []

        for (let i = 0; i < singleBills.length; i++) {
          let sentBill = singleBills[i]
          let key = sentBill.id
          removeSentBills[key] = null
          updateProducts.push({ productID: sentBill.productID, amount: sentBill.quantity })
        }

        this.afDB.object(`Invoices/sent/`).update(removeSentBills)

        for (let i = 0; i < updateProducts.length; i++) {
          let update: { productID: string, amount: number } = updateProducts[i]
          this.updateProductAmoutAfterReturn(update.productID, update.amount)
        }
      })
  }

  updateProductAmount(productID: string, justHadBuy: number) {
    this.afDB
      .object<Product>('Products/' + productID)
      .valueChanges()
      .first()
      .subscribe(product => {
        let oldAmount = product.amount
        let newAmount = oldAmount - justHadBuy
        this.afDB.object<Product>('Products/' + productID).update({ amount: newAmount })
      })
  }

  sentReqFromCart(bills: SingleBill[], invoice: TotalBill) {
    let billList = this.afDB.list('Bills/')
    const newKey = billList.push('new item').key


    let newBill: TotalBill = invoice
    newBill.id = newKey
    //------------>
    let sentBills = {}
    let removeCartBills = {}
    //------------->
    //------------->

    for (var i = 0; i < bills.length; i++) {
      bills[i].totalBillID = newKey

      newBill.productName.push(bills[i].productName)

      sentBills[bills[i].id] = bills[i] // update sent bills
      removeCartBills[bills[i].id] = null // remove cart bills
      //productUpdate
      this.updateProductAmount(bills[i].productID, bills[i].quantity)
    }

    return Observable
      .forkJoin(
        // create total bill
        this.afDB.object(`Bills/${newKey}`).update(newBill),
        // create sent bills
        this.afDB.object('Invoices/sent/').update(sentBills),
        // delete cart bills
        this.afDB.object('Invoices/cart/').update(removeCartBills),
      // update products amount
      // ------------------------------------------------>
    )

  }

  getSentList(phone: string): Observable<TotalBill[]> {
    return this.afDB.list<TotalBill>(
      `Bills/`,
      ref => ref.orderByChild('userID_status').equalTo(`${phone}_1`)
    ).valueChanges()
  }

  getCheckedList(phone: string): Observable<TotalBill[]> {
    return this.afDB.list<TotalBill>(
      `Bills/`,
      ref => ref.orderByChild('userID_status').equalTo(`${phone}_2`)
    ).valueChanges()
  }

  getDoneList(phone: string): Observable<TotalBill[]> {
    return this.afDB.list<TotalBill>(
      `Bills/`,
      ref => ref.orderByChild('userID_status').equalTo(`${phone}_3`)
    ).valueChanges()
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

  productRate(rating: Rating): Promise<boolean> {

    let messageRef = this.afDB.object(`Ratings/${rating.productID}/${rating.userID}/`)

    rating.time = - new Date().getTime()

    let productRating = this.afDB.object(`Products/${rating.productID}/ratings/${rating.userID}`)

    return Promise.all([
      productRating.update({ value: rating.rate }),
      messageRef.update(rating)
    ])
      .then(() => true)
      .catch(err => false)
  }

  getUserRating(userID: string, productID: string): Observable<Rating> {
    return this.afDB.object<Rating>(`Ratings/${productID}/${userID}/`).valueChanges()
  }

  getAllRatingsOfProduct(productID: string): Observable<Rating[]> {
    return this.afDB.list<Rating>(
      `Ratings/${productID}/`,
      ref => ref.orderByChild('time')
    ).valueChanges()
  }

  newAddress(userPhone: string, addressInfo: AddressInfo) {

    let addressInfoList = this.afDB.list(`Users/${userPhone}/deliverAddresses`)
    const newKey = addressInfoList.push('new item').key
    addressInfo.id = newKey
    return this.afDB.object(`Users/${userPhone}/deliverAddresses/${newKey}`).update(addressInfo)
  }

  updateAddress(userPhone: string, addressInfo: AddressInfo) {
    return this.afDB.object(`Users/${userPhone}/deliverAddresses/${addressInfo.id}`).update(addressInfo)
  }

  removeAddress(userPhone: string, addressInfoID: string) {
    return this.afDB.object(`Users/${userPhone}/deliverAddresses/${addressInfoID}`).remove()
  }

  getHotline() {
    return this.afDB.object<AppsCfg>('Apps').valueChanges()
  }

}
