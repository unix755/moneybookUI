import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {lastValueFrom, retry} from "rxjs"
import {environment} from "../app.component"
import {ACCOUNT} from "../share/definition/account"

@Injectable()
export class AccountService {
    url1 = new URL("/account", environment.server).toString()

    constructor(private http: HttpClient) {
    }

    async createAccount(accountBody: ACCOUNT) {
        return await lastValueFrom(this.http.post<ACCOUNT>(this.url1, accountBody).pipe(retry(3)))
            .then(a => a)
            .catch(error => Promise.reject(error))
    }

    async updateAccount(accountBody: ACCOUNT) {
        return await lastValueFrom(this.http.put<ACCOUNT>(this.url1, accountBody).pipe(retry(3)))
            .then(a => a)
            .catch(error => Promise.reject(error))
    }

    async deleteAccount(ids: Set<string>) {
        return await lastValueFrom(this.http.delete<{ count: number }>
        (this.url1, {params: {"ids": Array.from(ids)}}).pipe(retry(3)))
            .then(resp => resp)
            .catch(error => Promise.reject(error))
    }

    async readAccount() {
        return await lastValueFrom(this.http.get<ACCOUNT[]>(this.url1).pipe(retry(3)))
            .then(as => as)
            .catch(error => Promise.reject(error))
    }
}