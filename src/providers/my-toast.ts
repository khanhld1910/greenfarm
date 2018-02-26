import { Injectable } from '@angular/core'
import { ToastController, AlertController, LoadingController } from 'ionic-angular'


@Injectable()
export class MyToastProvider {

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  myToast(
    opts: {
      message?: string,
      duration?: number,
      position?: string,
      showCloseButton?: boolean,
      closeButtonText?: string,
      cssClass?: string,
      dismissOnPageChange?: boolean
    },
    complete?
  ) {
    let toast = this.toastCtrl.create(opts)
    toast.onWillDismiss(() => {
      if (complete !== undefined) {
        setTimeout(() => {
          complete()
        }, 500)
      }
    })
    toast.present()
  }

  myConfirmAlert(title: string, message: string, onCancel, onConfirm) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'Hủy bỏ',
          role: 'cancel',
          handler: () => {
            alert.dismiss().then(() => {
              if (onCancel) {
                onCancel()
              }
            })
            return false
          }
        },
        {
          text: 'Đồng ý',
          handler: () => {
            alert.dismiss().then(() => {
              if (onConfirm) {
                onConfirm()
              }
            })
            return false
          }
        }
      ]
    })
    alert.present()
  }

  customLoading() {
    return this.loadingCtrl.create({
      content: `Đang tải dữ liệu`,
    })
  }

}
