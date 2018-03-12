import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { MyDbProvider } from '../../providers/my-db';
import { UserDataProvider } from '../../providers/user-data';

@Component({
  selector: 'address-modal',
  templateUrl: 'address-modal.html',
})
export class AddressModalPage {

  title: string
  address: string
  addresses: string[]
  index: number
  editMode: boolean
  errMsg: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private dbProvider: MyDbProvider,
    private userData: UserDataProvider
  ) {
    this.editMode = this.navParams.get('isEdit')
  }

  ionViewDidLoad() {
    if (this.editMode) {
      this.title = 'Cập nhật địa chỉ'
      this.addresses = this.navParams.get('addresses')
      this.index = this.navParams.get('index') || 0
      this.address = this.addresses[this.index]

    } else {
      this.address = ''
      this.title = 'Thêm mới địa chỉ'
    }

  }

  createAddress() {
    if (!this.address || this.address.length < 10) {
      this.errMsg = 'Địa chỉ không hợp lệ'
      return
    }
    this.dbProvider
      .newAddress(this.userData.userPhone, this.address)
      .then(() => this.dismiss())
  }

  updateAddress() {
    if (!this.address || this.address.length < 10) {
      this.errMsg = 'Địa chỉ không hợp lệ'
      return
    }
    this.addresses[this.index] = this.address

    let addresses_Obj = this.addresses.reduce((acc, cur, i) => {
      acc[i] = cur
      return acc
    }, {})


    this.dbProvider
      .updateAddresses(this.userData.userPhone, addresses_Obj)
      .then(() => this.dismiss())

  }

  deleteAddress() {
    this.addresses.splice(this.index, 1)

    let addresses_Obj = this.addresses.reduce((acc, cur, i) => {
      acc[i] = cur
      return acc
    }, {})


    this.dbProvider
      .updateAddresses(this.userData.userPhone, addresses_Obj)
      .then(() => this.dismiss())

  }

  dismiss() {
    this.viewCtrl.dismiss()
  }

}
