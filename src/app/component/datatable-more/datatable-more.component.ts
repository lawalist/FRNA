import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import {global} from '../../globale/variable';

@Component({
  selector: 'app-datatable-more',
  templateUrl: './datatable-more.component.html',
  styleUrls: ['./datatable-more.component.scss'],
})
export class DatatableMoreComponent implements OnInit {

  retournedAction: any;
  mobile = global.mobile;
  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.retournedAction = this.navParams.data.action;
   }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
