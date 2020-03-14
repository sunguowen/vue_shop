<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 条件搜索区域 -->
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="input3">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="300"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === 1" type="success">已付款</el-tag>
            <el-tag type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            <span>{{scope.row.create_time | formatDate}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-tooltip class="item" effect="dark" content="修改地址" :enterable="false" placement="top">
            <el-button type="primary" icon="el-icon-edit" @click="showModifyAddress()"></el-button>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="查看配送信息"
            :enterable="false"
            placement="top"
          >
            <el-button type="success" icon="el-icon-location" @click="showExpressStepDialog"></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
      <!-- 数据分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="modifyAddressDialogVisible"
      width="50%"
      @close="modifyAddressDialogClose"
    >
      <el-form
        :model="modifyAddressForm"
        :rules="modifyAddressFormRules"
        ref="modifyAddressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="provice">
          <!-- <el-input v-model="modifyAddressForm.provice"></el-input> -->
          <el-cascader
            :options="cityOptions"
            v-model="modifyAddressForm.provice"
            :value="city"
            @change="changeProvince"
            change-on-select
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="modifyAddressForm.detail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyAddressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息对话框 -->
    <el-dialog title="物流信息" :visible.sync="ExpressStepDialogVisible" width="50%">
      <!-- 物流进度时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in expressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityOptions from './city_data2017_element'
export default {
  data() {
    return {
      // 查询订单的请求对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总的订单数量
      total: '',
      // 订单数据
      orderList: [],
      // 控制修改地址对话框的可见性
      modifyAddressDialogVisible: false,
      // 修改地址表单对象
      modifyAddressForm: {
        provice: [],
        detail: ''
      },
      // 修改地址表单验证规则
      modifyAddressFormRules: {
        provice: [{ required: true, message: '请选择省市区', trigger: 'blur' }],
        detail: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },
      // 省市区联动数据
      cityOptions: cityOptions,
      // 物流信息对话框的可见性
      ExpressStepDialogVisible: false,
      // 物流信息
      expressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.total = res.data.total
      this.orderList = res.data.goods
      console.log(this.orderList)
    },
    // 当页面大小改变时调用
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getOrderList()
    },
    // 当前页码改变时调用
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getOrderList()
    },
    // 点击修改地址按钮之后调用
    showModifyAddress() {
      this.modifyAddressDialogVisible = true
    },
    // 联机选择改变时调用
    changeProvince() {
      console.log(this.modifyAddressForm.provice)
    },
    // 修改地址对话框关闭时触发
    modifyAddressDialogClose() {
      this.$refs.modifyAddressFormRef.resetFields()
    },
    // 点击查看物流的按钮显示物流对话框
    showExpressStepDialog() {
      this.getExpressInfo()
      this.ExpressStepDialogVisible = true
    },
    // 获取物流信息
    async getExpressInfo() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.expressInfo = res.data
      console.log(this.expressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

.el-cascader {
  width: 100%;
}
</style>
