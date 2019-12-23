import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-liste-action',
  templateUrl: './liste-action.component.html',
  styleUrls: ['./liste-action.component.scss'],
})
export class ListeActionComponent implements OnInit {
  retournedAction: any;
  retournetLimite: any;
  monInstitution: any = false;
  localite: any;
  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.retournedAction = this.navParams.data.action;
    this.retournetLimite = this.navParams.data.limite;
    this.monInstitution = this.navParams.data.monInstitution;
    this.localite = this.navParams.data.localite;
   }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }

}
