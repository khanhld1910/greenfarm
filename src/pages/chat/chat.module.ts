import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    PipesModule,
  ],
  exports: [
    ChatPage
  ],
})
export class ChatPageModule {}
