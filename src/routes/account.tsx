import {useState} from "react"
import {createFileRoute} from "@tanstack/react-router"
import {useQuery} from "@tanstack/react-query"
import {Badge, Button, Flex, Table, type TableColumnsType, type TableProps} from "antd"
import {API_readAccount} from "../apis/account.ts"
import type {ACCOUNT} from "../types/account.ts"

export const Route = createFileRoute("/account")({
    component: RouteComponent,
})

function RouteComponent() {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    // const [selectedItems, setSelectedItems] = useState<ACCOUNT[]>([])

    const columns: TableColumnsType<ACCOUNT> = [
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "号码",
            dataIndex: "number",
            key: "number",
        },
        {
            title: "类型",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "资金",
            dataIndex: "funds",
            key: "funds",
        }
    ]

    const rowSelection: TableProps<ACCOUNT>["rowSelection"] = {
        getCheckboxProps: (record: ACCOUNT) => ({
            disabled: record.name === "Disabled User",
            name: record.name,
        }),
    }

    const readAccountsQuery = useQuery({
        queryKey: ["readAccounts"],
        queryFn: API_readAccount
    })

    function handleClickSelectAllButton() {
        setSelectedIds([...new Set(readAccountsQuery.data?.flatMap(a => a.id)) ?? []])
    }

    function handleClickClearButton() {
        setSelectedIds([])
    }

    return (
        <Flex gap="small" vertical={true}>
            <Flex justify="space-between">
                <Flex align="flex-start" gap="small">
                    <Button disabled={selectedIds.length === readAccountsQuery.data?.length}
                            loading={readAccountsQuery.isFetching} onClick={handleClickSelectAllButton}>
                        全选
                    </Button>
                    <Badge count={selectedIds.length}>
                        <Button disabled={selectedIds.length === 0}
                                loading={readAccountsQuery.isFetching} onClick={handleClickClearButton}>
                            清除
                        </Button>
                    </Badge>
                </Flex>
                <Flex align="flex-end" gap="small">
                    <Button type="primary" danger={true} disabled={selectedIds.length === 0}
                            loading={readAccountsQuery.isFetching} onClick={() => true}>
                        删除
                    </Button>
                    <Button type="primary" disabled={selectedIds.length !== 1}
                            loading={readAccountsQuery.isFetching} onClick={() => true}>
                        修改
                    </Button>
                    <Button type="primary"
                            loading={readAccountsQuery.isFetching} onClick={() => true}>
                        新建
                    </Button>
                </Flex>
            </Flex>
            <Table columns={columns} dataSource={readAccountsQuery.data} rowSelection={rowSelection}
                   rowKey={(record) => record.id}>
            </Table>
        </Flex>
    )
}
