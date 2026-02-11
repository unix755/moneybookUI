import type {ACCOUNT} from "../types/account.ts"

const url = new URL("/account", "http://nas.internal:8000").toString()

async function API_createAccount(accountBody: ACCOUNT): Promise<ACCOUNT> {
    const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify(accountBody)
    })
    return await resp.json()
}

async function API_updateAccount(accountBody: ACCOUNT): Promise<ACCOUNT> {
    const resp = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(accountBody)
    })
    return await resp.json()
}

async function API_deleteAccount(ids: string[]): Promise<{ count: number }> {
    const resp = await fetch(url, {
        method: "DELETE",
        body: JSON.stringify({params: {"ids": ids}})
    })
    return await resp.json()
}

async function API_readAccount(): Promise<ACCOUNT[]> {
    const resp = await fetch(url, {
        method: "GET"
    })
    return await resp.json()
}

export {
    API_createAccount,
    API_updateAccount,
    API_deleteAccount,
    API_readAccount
}