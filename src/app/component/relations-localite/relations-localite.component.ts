import { Component, OnInit } from '@angular/core';
import { global } from '../../globale/variable';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-relations-localite',
  templateUrl: './relations-localite.component.html',
  styleUrls: ['./relations-localite.component.scss'],
})
export class RelationsLocaliteComponent implements OnInit {

  global = global;
  constructor(private navParams: NavParams, private popoverController: PopoverController) { }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
