import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {lastValueFrom, retry} from "rxjs"
import {TRANSACTION, TRANSACTION_INPUT, TRANSACTION_OUTPUT} from "../share/definition/transaction"
import {environment} from "../app.component"

@Injectable()
export class TransactionService {
    url1 = new URL("/transaction", environment.server).toString()
    url2 = new URL("/transaction/status", environment.server).toString()
    url3 = new URL("/transaction/condition", environment.server).toString()

    constructor(private http: HttpClient) {
    }

    async createTransaction(transactionBody: TRANSACTION_INPUT) {
        return await lastValueFrom(this.http.post<TRANSACTION>(this.url1, transactionBody).pipe(retry(3)))
            .then(a => a)
            .catch(error => Promise.reject(error))
    }

    async updateTransaction(transactionBody: TRANSACTION_INPUT) {
        return await lastValueFrom(this.http.put<TRANSACTION>(this.url1, transactionBody).pipe(retry(3)))
            .then(a => a)
            .catch(error => Promise.reject(error))
    }

    async deleteTransaction(ids: Set<string>) {
        return await lastValueFrom(this.http.delete<{ count: number }>
        (this.url1, {params: {"ids": Array.from(ids)}}).pipe(retry(3)))
            .then(resp => resp)
            .catch(error => Promise.reject(error))
    }

    async readTransaction() {
        return await lastValueFrom(this.http.get<TRANSACTION_OUTPUT[]>(this.url1).pipe(retry(3)))
            .then(as => as)
            .catch(error => Promise.reject(error))
    }

    async readTransactionBasedOnCondition(ids?: string[], title?: string, productIds?: string[], typeIds?: string[], accountIds?: string[], startTime?: string, endTime?: string, status?: string[]) {
        return await lastValueFrom(this.http.get<TRANSACTION_OUTPUT[]>
        (this.url3, {
            params: JSON.parse(JSON.stringify({
                "ids": ids,
                "title": title,
                "productIds": productIds,
                "typeIds": typeIds,
                "accountIds": accountIds,
                "startTime": startTime?.toString(),
                "endTime": endTime?.toString(),
                "status": status
            }).toString())
        })
            .pipe(retry(3)))
            .then(as => as)
            .catch(error => Promise.reject(error))
    }

    async patchTransactionStatus(ids: string[], status: string) {
        return await lastValueFrom(this.http.patch<{ count: number }>
        (this.url2, {ids: ids, status: status}).pipe(retry(3)))
            .then(as => as)
            .catch(error => Promise.reject(error))
    }
}