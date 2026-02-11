import {createHashHistory, createRouter, RouterProvider} from "@tanstack/react-router"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {routeTree} from "./routeTree.gen"
import "./App.css"

const router = createRouter({routeTree, history: createHashHistory()})
const queryClient = new QueryClient()

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    )
}

export default App
