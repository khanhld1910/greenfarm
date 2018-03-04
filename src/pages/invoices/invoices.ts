import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage({
  name: 'InvoicesPage'
})
@Component({
  selector: 'invoices',
  templateUrl: 'invoices.html',
})
export class InvoicesPage {

  status: string

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {
  }

  ionViewDidLoad() {
    this.status = 'sent'
  }

}
