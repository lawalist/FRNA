import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-datatable-construct',
  templateUrl: './datatable-construct.component.html',
  styleUrls: ['./datatable-construct.component.scss'],
})
export class DatatableConstructComponent implements OnInit {

  retournedAction: any;
  cacheAction: any;
  localite: any;
  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.retournedAction = this.navParams.data.action;
    this.cacheAction = this.navParams.data.cacheAction;
    this.localite = this.navParams.data.localite;
   }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
