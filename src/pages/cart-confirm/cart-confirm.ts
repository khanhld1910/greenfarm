import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SingleBill } from '../../interfaces/bill';
import { UserDataProvider } from '../../providers/user-data';
import { AddressModalPage } from '../address-modal/address-modal';


@IonicPage({
  name: 'CartConfirmPage'
})
@Component({
  selector: 'cart-confirm',
  templateUrl: 'cart-confirm.html',
})
export class CartConfirmPage {

  cartBills: SingleBill[]
  addresses: string[] = []
  addressSelectedIndex: number = 0

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userData: UserDataProvider,
    private modalCtrl: ModalController
  ) {
    this.cartBills = this.navParams.get('cart')
  }

  ionViewDidLoad() {
    this.userData
      .getUserAddresses(this.userData.userPhone)
      .subscribe(value => this.addresses = value)
  }

  isAddressChecked(addressIndex: number) {
    return this.addressSelectedIndex == addressIndex
  }

  setCheckedIndex(index: number) {
    this.addressSelectedIndex = index
  }

  addressModal(index?: number) {
    //console.log(index)

    let addressModal

    if (!index || index < 0) {
      // new address
      addressModal = this.modalCtrl.create(AddressModalPage, { isEdit: false })
    } else {
      // edit address
      console.log(index)
      addressModal = this.modalCtrl.create(AddressModalPage, { isEdit: true, index: index, addresses: this.addresses });
    }

    addressModal.present()
  }

}
