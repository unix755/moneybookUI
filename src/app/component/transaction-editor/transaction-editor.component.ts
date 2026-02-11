import {Component, EventEmitter, OnInit, Output} from "@angular/core"
import {HttpErrorResponse} from "@angular/common/http"
import {NzMessageService} from "ng-zorro-antd/message"
import {TypeService} from "../../service/type.service"
import {AccountService} from "../../service/account.service"
import {ProductService} from "../../service/product.service"
import {TYPE} from "../../share/definition/type"
import {ACCOUNT} from "../../share/definition/account"
import {PRODUCT} from "../../share/definition/product"
import {TRANSACTION_INPUT, TRANSACTION_OUTPUT} from "../../share/definition/transaction"
import {TransactionStatus} from "../../share/definition/transactionStatus"

@Component({
    selector: "app-component-transaction-editor",
    templateUrl: "./transaction-editor.component.html",
    styleUrls: ["./transaction-editor.component.css"]
})
export class TransactionEditorComponent implements OnInit {
    // 对话框变量
    // 对话框标题
    title = ""
    // 对话框数据
    data: TRANSACTION_INPUT = {
        id: undefined,
        title: undefined,
        typeId: undefined,
        accountId: undefined,
        amount: undefined,
        datetime: new Date(Date.now()),
        status: undefined,
        productIds: undefined
    }
    // 是否显示对话框
    isVisible = false

    // 下拉选择框数据
    // 从服务端获取到的选择框中可选项数据
    types: TYPE[] = []
    accounts: ACCOUNT[] = []
    products: PRODUCT[] = []
    status = TransactionStatus
    // 选择框绑定的数据
    bindProducts: PRODUCT[] = []
    bindAccount: ACCOUNT
    bindType: TYPE

    // 外部组件调用来读取数据
    @Output() readEditorData = new EventEmitter<TRANSACTION_INPUT>()

    // 构筑函数,用于注册服务
    constructor(private productService: ProductService, private accountService: AccountService, private typeService: TypeService, private message: NzMessageService) {
    }

    // 选择控件值对比函数
    compareWith(o1: any, o2: any) {
        return o1?.id === o2?.id ? true : o1 === o2
    }

    // 生命周期
    async ngOnInit() {
        await this.productService.readProduct()
            .then(ds => this.products = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))

        await this.typeService.readType()
            .then(ds => this.types = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))

        await this.accountService.readAccount()
            .then(ds => this.accounts = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
    }

    // 显示对话框, 外部观察器调用来弹出对话框
    show(newData?: TRANSACTION_OUTPUT) {
        if (newData !== undefined) {
            this.title = "修改"
            this.data = newData

            this.bindType = newData.type
            this.bindAccount = newData.account
            this.bindProducts = newData.ProductOnTransaction.map(p => p.product)
        } else {
            this.title = "新建"
            this.data = {
                id: undefined,
                title: undefined,
                typeId: undefined,
                accountId: undefined,
                amount: undefined,
                datetime: new Date(Date.now()),
                status: undefined,
                productIds: undefined
            }
            this.bindType = undefined
            this.bindAccount = undefined
            this.bindProducts = []
        }
        this.isVisible = true
    }

    // 检验数据是否符合, 不符合确认按钮被禁用
    isDataOK() {
        return this.data.title === undefined || this.data.title === "" || this.bindType?.id === undefined || this.bindType?.id === "" || this.bindAccount?.id === undefined || this.bindAccount?.id === "" || this.data.amount === undefined
    }

    // 确认按钮, 将编辑器的结果传递给外部组件
    okButton() {
        this.data.typeId = this.bindType.id
        this.data.accountId = this.bindAccount.id
        this.data.productIds = this.bindProducts.map(p => p.id)

        this.readEditorData.emit(this.data)
        this.isVisible = false
    }

    // 取消按钮
    cancelButton() {
        this.isVisible = false
    }
}
