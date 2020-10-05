import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  eventData: any;
  private subject: any;

  constructor() {
    this.eventData = {};
    this.subject = new BehaviorSubject<any>(this.eventData);
  }

  saveEvent(key: string, value: any) {
    this.eventData[key] ? this.eventData[key].push(value) : this.eventData[key] = [value];
    this.subject.next(this.eventData[key]);
  }

  getEvent() {
    return this.subject.asObservable();
  }

  checkEvents(key) {
    this.subject.next(this.eventData[key]);
  }
}
