import {Component, OnInit, ViewChild} from "@angular/core"
import {NzMessageService} from "ng-zorro-antd/message"
import {HttpErrorResponse} from "@angular/common/http"
import {PRODUCT, ProductTableHeaders} from "../../share/definition/product"
import {ProductService} from "../../service/product.service"
import {ProductEditorComponent} from "../product-editor/product-editor.component"

@Component({
    selector: "app-component-product",
    templateUrl: "./product.component.html",
    styleUrls: ["./product.component.css"]
})

export class ProductComponent implements OnInit {
    // 编辑器子组件观察器
    @ViewChild("editor")
    editor: ProductEditorComponent

    // 表头变量
    tableHeaders = ProductTableHeaders

    // 表头全选框变量
    // 是否全选
    selectAll = false
    // 是否部分选择
    selectSome = false
    // 被选中的所有的id
    selectedIds = new Set<string>()

    // 表内容变量
    // 表中所有数据
    data: PRODUCT[] = []
    // 当前页面中表的数据(随着页码,页面大小变化)
    dataCurrentPage: PRODUCT[] = []
    // 是否显示加载状态
    isLoading = false

    // 构筑函数,用于注册服务
    constructor(private productService: ProductService, private message: NzMessageService) {
    }

    // 生命周期
    async ngOnInit() {
        await this.readData()
    }

    // 表格中当前页的数据发生改变时刷新变量状态
    onCurrentPageDataChange($event: readonly PRODUCT[]) {
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
    checkItemBox($event: boolean, item: PRODUCT) {
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
    async readEditorData($event: PRODUCT) {
        if ($event.id !== undefined) {
            await this.updateData($event)
        } else {
            await this.createData($event)
        }
    }

    // 网络请求
    async createData(body: PRODUCT) {
        this.isLoading = true
        await this.productService.createProduct(body)
            .then(d => this.data = this.data.concat(d))
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async updateData(body: PRODUCT) {
        this.isLoading = true
        await this.productService.updateProduct(body)
            .then(async () => await this.readData())
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async deleteData(selectedIds: Set<string>) {
        this.isLoading = true
        await this.productService.deleteProduct(selectedIds)
            .then(async () => await this.readData())
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }

    async readData() {
        this.isLoading = true
        await this.productService.readProduct()
            .then(ds => this.data = [...ds])
            .catch((e: HttpErrorResponse) => this.message.error(e.message))
            .finally(() => this.isLoading = false)
    }
}