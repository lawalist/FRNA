import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EssaiPage } from './essai.page';

describe('EssaiPage', () => {
  let component: EssaiPage;
  let fixture: ComponentFixture<EssaiPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EssaiPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EssaiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
