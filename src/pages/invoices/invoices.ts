import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { TotalBill } from '../../interfaces/bill';
import { UserDataProvider } from '../../providers/user-data';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';
import { SmartAudio } from '../../providers/smart-audio';

@IonicPage({
  name: 'InvoicesPage'
})
@Component({
  selector: 'invoices',
  templateUrl: 'invoices.html',
})
export class InvoicesPage {

  status: string = 'sent'
  billList: TotalBill[]
  sentList: TotalBill[]
  checkedList: TotalBill[]
  doneList: TotalBill[]

  constructor(
    private userDataProvider: UserDataProvider,
    private dbProvider: MyDbProvider,
    private myToast: MyToastProvider,
    private navCtrl: NavController,
    private smartAudio: SmartAudio
  ) {
  }

  ionViewDidLoad() {
    let loading = this.myToast.performLoading('đang tải dữ liệu ...')

    this.dbProvider
      .getBillList(this.userDataProvider.userPhone)
      .subscribe(value => {
        this.billList = (value && value.length >0) ? value : []
        this.sentList = this.billList.filter(bill => bill.status === 1)
        this.checkedList = this.billList.filter(bill => bill.status === 2)
        this.doneList = this.billList.filter(bill => bill.status === 3)
      })


    loading.dismiss()

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
    this.smartAudio.play('tap')
    this.myToast.myConfirmAlert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn đặt hàng?',
      () => {
        return false
      },
      () => {
        this.confirmRemoveBill(totalBillID)
      }
    )
  }

  confirmRemoveBill(totalBillID: TotalBill) {
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
    return this.userDataProvider.timeDisplay(time)
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
    this.smartAudio.play('tap')
    this.navCtrl.push('BillDetailsPage', { 'totalBill': totalBill })
  }

}
