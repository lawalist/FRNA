import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitementPage } from './traitement.page';

describe('TraitementPage', () => {
  let component: TraitementPage;
  let fixture: ComponentFixture<TraitementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraitementPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraitementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
