import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import * as range from 'lodash.range';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';

export interface CalendarDate {
  mDate: moment.Moment;
  selected?: boolean;
  today?: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  public currentDate: moment.Moment;
  public namesOfDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public weeks: Array<CalendarDate[]> = [];

  public selectedDate;
  public show: boolean;
  public eventForm: FormGroup;
  public showEventForm: boolean;
  public allEvent: any;
  @ViewChild('calendar', {static: true}) calendar;

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.show = false;
    }
  }

  constructor(private eRef: ElementRef, private localStorageService: LocalStorageService) {
  }

  ngOnInit() {
    this.showEventForm = false;
    this.currentDate = moment();
    this.selectedDate = moment(this.currentDate).format('DD/MM/YYYY');
    this.generateCalendar();

    this.localStorageService.getEvent().subscribe(res => {
      const eventDate: Date = moment(this.selectedDate, 'DD/MM/YYYY').toDate();
      const key = `${eventDate.getMonth()}${eventDate.getFullYear()}`;
      this.allEvent = res;
    });

    this.eventForm = new FormGroup({
      hours: new FormControl('', Validators.required),
      minute: new FormControl('', Validators.required),
      event_name: new FormControl('', Validators.required),
    });
  }

  onSubmit(): void {
    const eventDate: Date = moment(this.selectedDate, 'DD/MM/YYYY').toDate();
    eventDate.setHours(this.eventForm.controls.hours.value);
    eventDate.setMinutes(this.eventForm.controls.minute.value);
    const payload: any = {
      date: eventDate,
      event_name: this.eventForm.controls.event_name.value
    };
    const key = `${eventDate.getMonth()}${eventDate.getFullYear()}`;
    this.localStorageService.saveEvent(key, payload);
    this.eventForm.reset();
  }

  private generateCalendar(): void {
    const dates = this.fillDates(this.currentDate);
    const weeks = [];
    while (dates.length > 0) {
      weeks.push(dates.splice(0, 7));
    }
    this.weeks = weeks;
  }

  private fillDates(currentMoment: moment.Moment) {
    const firstOfMonth = moment(currentMoment).startOf('month').day();
    const lastOfMonth = moment(currentMoment).endOf('month').day();

    const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
    const lastDayOfGrid = moment(currentMoment).endOf('month').subtract(lastOfMonth, 'days').add(7, 'days');

    const startCalendar = firstDayOfGrid.date();

    return range(startCalendar, startCalendar + lastDayOfGrid.diff(firstDayOfGrid, 'days')).map((date) => {
      const newDate = moment(firstDayOfGrid).date(date);
      return {
        today: this.isToday(newDate),
        selected: this.isSelected(newDate),
        mDate: newDate,
      };
    });
  }

  public prevMonth(): void {
    this.currentDate = moment(this.currentDate).subtract(1, 'months');
    this.generateCalendar();

    this.showEventForm = false;
    const eventDate: Date = moment(this.currentDate, 'DD/MM/YYYY').toDate();
    const key = `${eventDate.getMonth()}${eventDate.getFullYear()}`;
    this.localStorageService.checkEvents(key);
  }

  public nextMonth(): void {
    this.currentDate = moment(this.currentDate).add(1, 'months');
    this.generateCalendar();
    
    this.showEventForm = false;
    const eventDate: Date = moment(this.currentDate, 'DD/MM/YYYY').toDate();
    const key = `${eventDate.getMonth()}${eventDate.getFullYear()}`;
    this.localStorageService.checkEvents(key);
  }

  public isDisabledMonth(currentDate): boolean {
    const today = moment();
    return moment(currentDate).isBefore(today, 'months');
  }

  private isToday(date: moment.Moment): boolean {
    return moment().isSame(moment(date), 'day');
  }

  private isSelected(date: moment.Moment): boolean {
    return this.selectedDate === moment(date).format('DD/MM/YYYY');
  }

  public isSelectedMonth(date: moment.Moment): boolean {
    const today = moment();
    return moment(date).isSame(this.currentDate, 'month') && moment(date).isSameOrBefore(today);
  }

  public selectDate(date: CalendarDate) {
    this.selectedDate = moment(date.mDate).format('DD/MM/YYYY');
    this.showEventForm = true;
    this.generateCalendar();
    this.show = !this.show;
  }
}

