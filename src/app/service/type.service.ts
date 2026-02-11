import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {lastValueFrom, retry} from "rxjs"
import {TYPE} from "../share/definition/type"
import {environment} from "../app.component"

@Injectable()
export class TypeService {
    url1 = new URL("/type", environment.server).toString()

    constructor(private http: HttpClient) {
    }

    async createType(typeBody: TYPE) {
        return await lastValueFrom(this.http.post<TYPE>(this.url1, typeBody).pipe(retry(3)))
            .then(a => a)
            .catch(error => Promise.reject(error))
    }

    async updateType(typeBody: TYPE) {
        return await lastValueFrom(this.http.put<TYPE>(this.url1, typeBody).pipe(retry(3)))
            .then(a => a)
            .catch(error => Promise.reject(error))
    }

    async deleteType(ids: Set<string>) {
        return await lastValueFrom(this.http.delete<{ count: number }>
        (this.url1, {params: {"ids": Array.from(ids)}}).pipe(retry(3)))
            .then(resp => resp)
            .catch(error => Promise.reject(error))
    }

    async readType() {
        return await lastValueFrom(this.http.get<TYPE[]>(this.url1).pipe(retry(3)))
            .then(as => as)
            .catch(error => Promise.reject(error))
    }
}