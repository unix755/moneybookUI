import {Component, OnInit, ViewChild} from "@angular/core"
import {NzMessageService} from "ng-zorro-antd/message"
import {HttpErrorResponse} from "@angular/common/http"
import {TRANSACTION_STATUS, TransactionStatus} from "../../share/definition/transactionStatus"
import {EndOfDay, EndOfMonth, EndOfYear, StartOfDay, StartOfMonth, StartOfYear} from "../../share/date/dataRange"
import {TRANSACTION_INPUT, TRANSACTION_OUTPUT, TransactionTableHeaders} from "../../share/definition/transaction"
import {TransactionEditorComponent} from "../transaction-editor/transaction-editor.component"
import {PRODUCT} from "../../share/definition/product"
import {TYPE} from "../../share/definition/type"
import {ACCOUNT} from "../../share/definition/account"
import {TransactionService} from "../../service/transaction.service"
import {ProductService} from "../../service/product.service"
import {TypeService} from "../../service/type.service"
import {AccountService} from "../../service/account.service"

@Component({
    selector: "app-component-transaction-search",
    templateUrl: "./transaction-search.component.html",
    styleUrls: ["./transaction-search.component.css"]
})
export class TransactionSearchComponent implements OnInit {
    // 编辑器子组件观察器
    @ViewChild("editor")
    editor: TransactionEditorComponent

    // 表头变量
    tableHeaders = TransactionTableHeaders

    // 表头全选框变量
    // 是否全选
    selectAll = false
    // 是否部分选择
    selectSome = false
    // 被选中的所有的id
    selectedIds = new Set<string>()

    // 表内容变量
    // 表中所有数据
    data: TRANSACTION_OUTPUT[] = []
    // 当前页面中表的数据(随着页码,页面大小变化)
    dataCurrentPage: TRANSACTION_OUTPUT[] = []
    // 是否显示加载状态
    isLoading = false

    // 下拉选择框数据
    // 从服务端获取到的选择框中可选项数据
    accounts: ACCOUNT[] = []
    types: TYPE[] = []
    products: PRODUCT[] = []
    status = TransactionStatus
    // 选择框绑定的数据
    bindKeyword = ""
    bindProducts: PRODUCT[] = []
    bindTypes: TYPE[] = []
    bindAccounts: ACCOUNT[] = []
    bindStatus: TRANSACTION_STATUS[] = []
    bindDatetime: Date[] = []
    bindAmount: number = 0
    bindDateRanges = {
        "Today": [StartOfDay(new Date()), EndOfDay(new Date())],
        "This Month": [StartOfMonth(new Date()), EndOfMonth(new Date())],
        "This Year": [StartOfYear(new Date()), EndOfYear(new Date())]
    }

    // 构筑函数,用于注册服务
    constructor(private transactionService: TransactionService, private productService: ProductService, private accountService: AccountService, private typeService: TypeService, private message: NzMessageService) {
    }


    // 生命周期
    async ngOnInit() {
        await this.productService.readProduct()
            .then(ds => this.products = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)

        await this.typeService.readType()
            .then(ds => this.types = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)

        await this.accountService.readAccount()
            .then(ds => this.accounts = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    // 表格中当前页的数据发生改变时刷新变量状态
    onCurrentPageDataChange($event: readonly TRANSACTION_OUTPUT[]) {
        this.dataCurrentPage = [].concat($event)
        this.refreshCheckBoxStatus()
    }

    // 表头全选框
    checkAllBox($event: boolean) {
        if ($event) {
            this.dataCurrentPage.forEach(t => this.selectedIds.add(t.id))
        } else {
            this.dataCurrentPage.forEach(t => this.selectedIds.delete(t.id))
        }
        this.refreshCheckBoxStatus()
    }

    // 表中数据选框
    checkItemBox($event: boolean, item: TRANSACTION_OUTPUT) {
        if ($event) {
            this.selectedIds.add(item.id)
        } else {
            this.selectedIds.delete(item.id)
        }
        this.refreshCheckBoxStatus()
    }

    // 刷新选择框的状态
    refreshCheckBoxStatus() {
        this.selectAll = this.selectedIds.size > 0 && this.dataCurrentPage.every(item => this.selectedIds.has(item.id))
        this.selectSome = this.selectedIds.size > 0 && this.dataCurrentPage.some(item => this.selectedIds.has(item.id)) && !this.selectAll
    }

    // 全选按钮
    selectAllButton() {
        this.data.forEach(t => this.selectedIds.add(t.id))
        this.refreshCheckBoxStatus()
    }

    // 清除按钮
    clearButton() {
        this.selectedIds.clear()
        this.refreshCheckBoxStatus()
    }

    // 删除按钮
    async deleteButton() {
        await this.deleteData(this.selectedIds)
        this.selectedIds.clear()
    }

    // 修改按钮
    modifyButton() {
        let ts = this.data.filter(item => this.selectedIds.has(item.id))
        if (ts.length == 1) {
            this.editor.show(ts[0])
        }
    }

    // 创建按钮
    createButton() {
        this.editor.show()
    }

    async submitButton() {
        this.data = []
        this.bindAmount = 0
        await this.transactionService.readTransactionBasedOnCondition(undefined, this.bindKeyword, this.bindProducts?.map(p => p.id), this.bindTypes?.map(t => t.id), this.bindAccounts?.map(a => a.id), this.bindDatetime[0]?.toString(), this?.bindDatetime[1]?.toString(), this.bindStatus?.map(s => s.value))
            .then(data => {
                this.data = data
                // 统计金额
                this.data.forEach((d, i) => {
                    this.data[i].datetime = new Date(this.data[i].datetime)
                    this.bindAmount += d.amount
                })
            })
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    // 处理子组件观察期传回来数据
    async readEditorData($event: TRANSACTION_INPUT) {
        if ($event.id !== undefined) {
            await this.updateData($event)
        } else {
            await this.createData($event)
        }
    }

    // 网络请求
    async createData(body: TRANSACTION_INPUT) {
        this.isLoading = true
        await this.transactionService.createTransaction(body)
            .then(async () => await this.readData())
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async updateData(body: TRANSACTION_INPUT) {
        this.isLoading = true
        await this.transactionService.updateTransaction(body)
            .then(async () => await this.readData())
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async deleteData(selectedIds: Set<string>) {
        this.isLoading = true
        await this.transactionService.deleteTransaction(selectedIds)
            .then(async () => await this.readData())
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async readData() {
        this.isLoading = true
        await this.transactionService.readTransaction()
            .then(ds => this.data = [...ds].map(d => {
                d.datetime = new Date(Date.parse(d.datetime as unknown as string))
                return d
            }))
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async updateDataStatus(status: string) {
        this.isLoading = true
        await this.transactionService.patchTransactionStatus(Array.from(this.selectedIds), status)
            .then(data => {
                if (data.count != undefined && data.count != 0) {
                    this.data.forEach((d, i, a) => {
                        this.selectedIds.forEach((selectedId) => {
                            if (d.id == selectedId) {
                                a[i].status = status
                            }
                        })
                    })
                }
            })
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    // 下拉框检查值是否已经被绑定
    isBound<T>(array: T[], v: T): boolean {
        return array.indexOf(v) === -1
    }
}