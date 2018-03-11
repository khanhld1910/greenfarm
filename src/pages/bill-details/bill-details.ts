import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TotalBill } from '../../interfaces/bill';

@IonicPage()
@Component({
  selector: 'bill-details',
  templateUrl: 'bill-details.html',
})
export class BillDetailsPage {

  bill: TotalBill

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.bill = navParams.get('totalBill')
  }


  ionViewDidLoad() {

  }

}
