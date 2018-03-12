import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartConfirmPage } from './cart-confirm';

@NgModule({
  declarations: [
    CartConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(CartConfirmPage),
  ],
  exports: [
    CartConfirmPage
  ]
})
export class CartConfirmPageModule {}
