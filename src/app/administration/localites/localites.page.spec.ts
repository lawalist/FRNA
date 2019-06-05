import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalitesPage } from './localites.page';

describe('LocalitesPage', () => {
  let component: LocalitesPage;
  let fixture: ComponentFixture<LocalitesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalitesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalitesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
