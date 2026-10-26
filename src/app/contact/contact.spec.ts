import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contact } from './contact';
import { ContactService } from '../contact.service';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [{ provide: ContactService, useValue: { send: async () => ({ message: '', emailSent: true }) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
