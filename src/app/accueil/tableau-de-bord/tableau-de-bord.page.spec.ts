import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauDeBordPage } from './tableau-de-bord.page';

describe('TableauDeBordPage', () => {
  let component: TableauDeBordPage;
  let fixture: ComponentFixture<TableauDeBordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableauDeBordPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableauDeBordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
