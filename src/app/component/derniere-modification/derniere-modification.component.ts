import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-derniere-modification',
  templateUrl: './derniere-modification.component.html',
  styleUrls: ['./derniere-modification.component.scss'],
})
export class DerniereModificationComponent implements OnInit {

  @Input() security: any;
  @Input() _id: any;
  @Input() _rev: string;
  rev: any;
  constructor(private modalController: ModalController) { 
  }

  ngOnInit() {
    this.rev = this._rev.substring(0, this._rev.indexOf('-'));
  }

  async close() {
    await this.modalController.dismiss();
  }
}
