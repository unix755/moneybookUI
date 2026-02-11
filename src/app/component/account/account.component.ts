import {Component, OnInit, ViewChild} from "@angular/core"
import {HttpErrorResponse} from "@angular/common/http"
import {NzMessageService} from "ng-zorro-antd/message"
import {ACCOUNT, AccountTableHeaders} from "../../share/definition/account"
import {AccountEditorComponent} from "../account-editor/account-editor.component"
import {AccountService} from "../../service/account.service"

@Component({
    selector: "app-component-account",
    templateUrl: "./account.component.html",
    styleUrls: ["./account.component.css"]
})

export class AccountComponent implements OnInit {
    // 编辑器子组件观察器
    @ViewChild("editor")
    editor: AccountEditorComponent

    // 表头变量
    tableHeaders = AccountTableHeaders

    // 表头全选框变量
    // 是否全选
    selectAll = false
    // 是否部分选择
    selectSome = false
    // 被选中的所有的id
    selectedIds = new Set<string>()

    // 表内容变量
    // 表中所有数据
    data: ACCOUNT[] = []
    // 当前页面中表的数据(随着页码,页面大小变化)
    dataCurrentPage: ACCOUNT[] = []
    // 是否显示加载状态
    isLoading = false

    // 构筑函数,用于注册服务
    constructor(private accountService: AccountService, private message: NzMessageService) {
    }

    // 生命周期
    async ngOnInit() {
        await this.readData()
    }

    // 表格中当前页的数据发生改变时刷新变量状态
    onCurrentPageDataChange($event: readonly ACCOUNT[]) {
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
    checkItemBox($event: boolean, item: ACCOUNT) {
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

    // 处理子组件观察期传回来数据
    async readEditorData($event: ACCOUNT) {
        if ($event.id !== undefined) {
            await this.updateData($event)
        } else {
            await this.createData($event)
        }
    }

    // 网络请求
    async createData(body: ACCOUNT) {
        this.isLoading = true
        await this.accountService.createAccount(body)
            .then(d => this.data = this.data.concat(d))
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async updateData(body: ACCOUNT) {
        this.isLoading = true
        await this.accountService.updateAccount(body)
            .then(async () => await this.readData())
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async deleteData(selectedIds: Set<string>) {
        this.isLoading = true
        await this.accountService.deleteAccount(selectedIds)
            .then(async () => await this.readData())
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async readData() {
        this.isLoading = true
        await this.accountService.readAccount()
            .then(ds => this.data = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }
}