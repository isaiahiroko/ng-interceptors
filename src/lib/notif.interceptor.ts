import { Injectable } from '@angular/core'
import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent } from '@angular/common/http'

import { finalize, retryWhen, zip, mergeMap, catchError } from 'rxjs/operators'
import { range,  timer,  throwError, Observable } from 'rxjs'

export class LoaderServiceContract {
  start (type?: string) {}
  stop () {}
  notify (message: string, title?: string) {}
  toast (message: string, title?: string) {}
}

@Injectable()
export class NotifInterceptor implements HttpInterceptor {
  constructor (
    private notif: LoaderServiceContract,
  ) {}

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.notif.start()

    // extend server response observable with logging
    return next.handle(req).pipe(
      // things don't always work as planned
      // if things go wrong, try again three times
      // however, delay trial in an incremental manner (multipl of 1 second)
      retryWhen((attempts) => {
        return attempts.pipe(
          zip(range(1, 4)),
          mergeMap(([error, i]) => {
            this.notif.start('query')
            if (i > 2) {
              return throwError(error)
            }
            return timer(i * 1000)
          })
        )
      }),

      // catchError http errors and turn to observable of undefined
      catchError((e) => {
        let title, message

        this.notif.start('buffer')

        if (e.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          title = 'Client Error'
          message = e.error.message
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          title = 'Network Info'
          message = `${e.statusText} (${e.status})`
          // message = e.message
        }
        
        if(e.status === 401){
          // this.notif.notify('The username/password is wrong', 'Unauthorized')
        }
        else{
          // this.notif.toast(message, title)
        }

        console.error({ title, message });
        
        // catche //re throw
        // throw {title, message}
        // return of({ e: {title, message} })
        // return empty()
        return throwError({ title, message})
      }),
      finalize(() => {
        this.notif.stop()
      }),
    )
  }
}
