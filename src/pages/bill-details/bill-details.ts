import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TotalBill, SingleBill } from '../../interfaces/bill';
import { UserDataProvider } from '../../providers/user-data';
import { MyDbProvider } from '../../providers/my-db';

@IonicPage()
@Component({
  selector: 'bill-details',
  templateUrl: 'bill-details.html',
})
export class BillDetailsPage {

  bill: TotalBill

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userData: UserDataProvider,
    private dbProvider: MyDbProvider,
  ) {
    this.bill = navParams.get('totalBill')
  }

  deliverTime: string
  sentTime: string
  address: string
  status: string
  totalCost: number
  singleBills: SingleBill[]

  ionViewDidLoad() {
    this.sentTime = this.userData.timeDisplay(this.bill.sentTime)
    this.deliverTime = this.userData.timeDisplay(this.bill.deliverTime)
    this.address = this.bill.address
    this.status = this.getStatus()
    this.totalCost = this.bill.totalCost

    this.dbProvider
      .getBillsInTotalBill(this.bill)
      .first()
      .subscribe(arr => this.singleBills = arr)
  }

  getStatus() {
    switch (this.bill.status) {
      case 1: {
        return 'Đang chờ duyệt'
      }
      case 2: {
        return 'Chờ giao hàng'
      }
      case 3: {
        return 'Đã hoàn thành'
      }
    }
  }

  

}
