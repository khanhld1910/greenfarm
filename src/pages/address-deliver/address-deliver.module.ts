import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddressDeliverPage } from './address-deliver';

@NgModule({
  declarations: [
    AddressDeliverPage,
  ],
  imports: [
    IonicPageModule.forChild(AddressDeliverPage),
  ],
  exports: [
    AddressDeliverPage
  ]
})
export class AddressDeliverPageModule {}
