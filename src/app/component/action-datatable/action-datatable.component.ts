import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { global } from '../../globale/variable';

@Component({
  selector: 'app-action-datatable',
  templateUrl: './action-datatable.component.html',
  styleUrls: ['./action-datatable.component.scss'],
})
export class ActionDatatableComponent implements OnInit {

  mobile: any = global.mobile;
  peutExporterDonnees = global.peutExporterDonnees;
  retournedAction: any;
  recherchePlus: any;
  filterAjouter: any;
  constructor(private popoverController: PopoverController, private navParams: NavParams) { 
    this.retournedAction = this.navParams.data.action;
    this.recherchePlus = this.navParams.data.recherchePlus;
    this.filterAjouter = this.navParams.data.filterAjouter;
  }

  ngOnInit() {}

  
  async dataTableSelectAll() {
    await this.popoverController.dismiss("dataTableSelectAll");
  }

  async dataTableSelectNon() {
    await this.popoverController.dismiss('dataTableSelectNon');
  }
  async doRefresh() {
    await this.popoverController.dismiss('doRefresh');
  }
  
  async dataTableAddRechercheParColonne() {
    await this.popoverController.dismiss('dataTableAddRechercheParColonne');
  }

  async dataTableAddCustomFiltre() {
    await this.popoverController.dismiss('dataTableAddCustomFiltre');
  }

  async exportExcel() {
    await this.popoverController.dismiss('exportExcel');
  }

  async changeStyle() {
    await this.popoverController.dismiss('changeStyle');
  }

  async choix1(a) {
    await this.popoverController.dismiss(a);
  }

}
