import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiquesPage } from './statistiques.page';

describe('StatistiquesPage', () => {
  let component: StatistiquesPage;
  let fixture: ComponentFixture<StatistiquesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatistiquesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatistiquesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
