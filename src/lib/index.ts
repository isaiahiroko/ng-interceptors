import { StoreSyncInterceptor } from './store-sync.interceptor'
import { AuthInterceptor } from './auth.interceptor'
import { NotifInterceptor } from './notif.interceptor'
import { HTTP_INTERCEPTORS } from '@angular/common/http'

export const INTERCEPTORS: any[] = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: StoreSyncInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: NotifInterceptor, multi: true }
]

export * from './store-sync.interceptor'
export * from './auth.interceptor'
export * from './notif.interceptor'
