import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';
import { TableauDeBordPage } from './tableau-de-bord.page';
import { LongPressModule } from 'ionic-long-press';

const routes: Routes = [
  {
    path: '',
    component: TableauDeBordPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicSelectableModule,
    LongPressModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TableauDeBordPage],
  entryComponents: [],
})
export class TableauDeBordPageModule {}
