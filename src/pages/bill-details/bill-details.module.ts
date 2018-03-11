import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BillDetailsPage } from './bill-details';

@NgModule({
  declarations: [
    BillDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(BillDetailsPage),
  ],
  exports: [
    BillDetailsPage
  ],
})
export class BillDetailsPageModule { }
