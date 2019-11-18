import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalitePage } from './localite.page';

describe('LocalitePage', () => {
  let component: LocalitePage;
  let fixture: ComponentFixture<LocalitePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalitePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalitePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
