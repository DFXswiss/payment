import { Observable, Subject } from "rxjs";

class NotificationServiceClass {
    private notifications$ = new Subject<string>();

    public get Notifications$(): Observable<string> {
        return this.notifications$;
    }

    public show(text: string): void {
        this.notifications$.next(text);
    }
}

const NotificationService = new NotificationServiceClass();
export default NotificationService;