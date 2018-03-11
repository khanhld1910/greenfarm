import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductReviewPage } from './product-review';

@NgModule({
  declarations: [
    ProductReviewPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductReviewPage),
  ],
  exports: [
    ProductReviewPage
  ]
})
export class ProductReviewPageModule {}
