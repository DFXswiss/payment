import { Observable, ReplaySubject } from "rxjs";


class ScrollServiceClass {
  private scrollPosition$ = new ReplaySubject<number>();

  public get ScrollPosition$(): Observable<number> {
    return this.scrollPosition$;
  }

  public set ScrollPosition(position: number) {
    this.scrollPosition$.next(position);
  }
}

const ScrollService = new ScrollServiceClass();
export default ScrollService;