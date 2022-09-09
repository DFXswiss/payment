import { Observable, Subject } from "rxjs";

export enum Level {
  SUCCESS = "Success",
  ERROR = "Error",
  WARNING = "Warning",
}

export interface Notification {
  text: string;
  level: Level;
}

class NotificationServiceClass {
  private notifications$ = new Subject<Notification>();

  public get Notifications$(): Observable<Notification> {
    return this.notifications$;
  }

  public success(text: string): void {
    this.notifications$.next({ text, level: Level.SUCCESS });
  }

  public warn(text: string): void {
    this.notifications$.next({ text, level: Level.WARNING });
  }

  public error(text: string): void {
    this.notifications$.next({ text, level: Level.ERROR });
  }
}

const NotificationService = new NotificationServiceClass();
export default NotificationService;
