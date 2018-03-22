import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AddressInfo } from '../../interfaces/bill';
import { NgForm } from '@angular/forms';
import { UserDataProvider } from '../../providers/user-data';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';
import { SmartAudio } from '../../providers/smart-audio';

@IonicPage()
@Component({
  selector: 'address-deliver',
  templateUrl: 'address-deliver.html',
})
export class AddressDeliverPage {

  form: AddressInfo
  submitted = false
  editMode = false
  title: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userData: UserDataProvider,
    private myDBProvider: MyDbProvider,
    private myToastProvider: MyToastProvider,
    private smartAudio: SmartAudio
  ) {
    this.editMode = <boolean>this.navParams.get('editMode')
    this.title = this.editMode ? 'Cập nhật địa chỉ' : 'Thêm mới địa chỉ'

    let newForm = {
      address: '',
      name: '',
      phone: '',
      id: ''
    }

    this.form = this.editMode ? this.navParams.get('addressInfo') : newForm

  }

  submit(form: NgForm) {

    this.smartAudio.play('tap')
    this.submitted = true
    if (!form.valid) return

    if (!this.editMode) {
      this.myDBProvider
        .newAddress(this.userData.userPhone, this.form)
        .then(() => {
          this.navCtrl.pop().then(() => {
            this.myToastProvider.myToast({
              message: 'Thêm địa chỉ thành công',
              position: 'top',
              cssClass: 'toast-info',
              duration: 1500
            })
          })
        })
      return
    }

    // edit mode

    this.myDBProvider
      .updateAddress(this.userData.userPhone, this.form)
      .then(() => {
        this.navCtrl.pop().then(() => {
          this.myToastProvider.myToast({
            message: 'Cập nhật địa chỉ thành công',
            position: 'top',
            cssClass: 'toast-info',
            duration: 1500
          })
        })
      })
  }

  delete() {

    this.smartAudio.play('tap')

    this.myDBProvider
      .removeAddress(this.userData.userPhone, this.form.id)
      .then(() => {
        this.navCtrl.pop().then(() => {
          this.myToastProvider.myToast({
            message: 'Đã xóa địa chỉ',
            position: 'top',
            cssClass: 'toast-info',
            duration: 1500
          })
        })
      })

  }


}
