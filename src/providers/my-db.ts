import { Injectable } from '@angular/core'
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Product } from '../interfaces/products';
import { User } from '../interfaces/user';
import { SingleBill } from '../interfaces/bill';
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

  newBill(bill: SingleBill): Promise<boolean> {
    let userInvoiceList = this.afDB.list('Invoices/' + bill.userID)
    const newKey = userInvoiceList.push('new item').key
    bill.id = newKey
    let singleBillRef = this.afDB.object('Invoices/' + bill.userID + '/' + bill.id)
    return singleBillRef.update(bill)
      .then(value => true)
      .catch(err => false)
  }

  userGetCartBills(phoneNumber: string): Observable<SingleBill[]> {
    return this.afDB.list<SingleBill>('Invoices/' + phoneNumber, ref => ref.orderByChild('status').equalTo(0)).valueChanges()
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

}
