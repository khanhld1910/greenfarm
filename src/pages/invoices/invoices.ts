import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { TotalBill } from '../../interfaces/bill';
import { UserDataProvider } from '../../providers/user-data';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';

@IonicPage({
  name: 'InvoicesPage'
})
@Component({
  selector: 'invoices',
  templateUrl: 'invoices.html',
})
export class InvoicesPage {

  status: string = 'sent'
  sentList: TotalBill[]
  checkedList: TotalBill[]
  doneList: TotalBill[]

  constructor(
    private userDataProvider: UserDataProvider,
    private dbProvider: MyDbProvider,
    private myToast: MyToastProvider,
    private navCtrl: NavController
  ) {
  }

  ionViewDidLoad() {
    let loading = this.myToast.performLoading('đang tải dữ liệu ...')

    this.dbProvider
      .getSentList(this.userDataProvider.userPhone)
      .subscribe(value => {
        this.sentList = value
        loading.dismiss()
      })

    this.dbProvider
      .getCheckedList(this.userDataProvider.userPhone)
      .subscribe(value => this.checkedList = value)

    this.dbProvider
      .getDoneList(this.userDataProvider.userPhone)
      .subscribe(value => this.doneList = value)

  }

  setClass() {
    return `invoice ${this.status} `
  }

  getBills() {
    switch (this.status) {
      case 'sent': return this.sentList
      case 'checked': return this.checkedList
      case 'done': return this.doneList
      default: return this.sentList
    }
  }

  removeInvoice(totalBillID: TotalBill) {
    let loading = this.myToast.performLoading('đang kết nối ...')
    this.dbProvider
      .removeInvoice(totalBillID)
      .then(async () => {
        await loading.dismiss()
        this.myToast.myToast({
          message: 'Đã hủy đơn đặt hàng',
          duration: 1500,
          position: 'top',
          cssClass: 'toast-primary'
        })
      })
      .catch(async () => {
        await loading.dismiss()
        this.myToast.myToast({
          message: 'Có lỗi xảy ra',
          duration: 1500,
          position: 'top',
          cssClass: 'toast-danger'
        })
      })

  }

  timeDisplay(time: string) {
    let date = new Date(time)
    return this.userDataProvider.lessThan10Format(date.getDate()) + '/' +
      this.userDataProvider.lessThan10Format(date.getMonth() + 1) + '/' +
      this.userDataProvider.lessThan10Format(date.getFullYear()) + ', ' +
      this.userDataProvider.lessThan10Format(date.getHours()) + ':' +
      this.userDataProvider.lessThan10Format(date.getMinutes())
  }

  formatNameForDisplaying(productNames: string[]): string {
    let willFormat = productNames.length > 3
    let result = ''

    for (let i = 0; i < productNames.length; i++) {

      let addingStr = ''

      if (willFormat) {
        addingStr = i == 0 ? `${this.formatSingleName(productNames[i])}` : `, ${this.formatSingleName(productNames[i])}`
      } else {
        addingStr = i == 0 ? productNames[i] : ', ' + productNames[i]
      }

      result += addingStr
    }
    return result
  }

  formatSingleName(productName: string) {
    return productName.substring(0, 10) + '...'
  }

  totalBillDetails(totalBill: TotalBill) {
    this.navCtrl.push('BillDetailsPage', { 'totalBill': totalBill })
  }

}
