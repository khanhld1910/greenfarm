import { Injectable } from '@angular/core'
import { ToastController, AlertController, LoadingController } from 'ionic-angular'


@Injectable()
export class MyToastProvider {

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
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

  performLoading(message?: any) {

    let svg = `
    <div class="my-custom-loading">
      <div class="my-custom-spinner shaking">
      </div>
      <h3 class="message">${message}</h3>
    </div>
    `
    //let safeSvg = this.sanitizer.bypassSecurityTrustHtml(svg);

    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: svg,
    })

    loading.present()

    return loading

  }

}
