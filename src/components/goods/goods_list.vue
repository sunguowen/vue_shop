<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片展示区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            clearable
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品信息列表区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
        <el-table-column label="添加时间" width="160px">
          <template slot-scope="scope">{{scope.row.add_time | formatDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary"></el-button>
            <el-button icon="el-icon-delete" type="danger" @click="deleteGoods(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表时的请求信息
      queryInfo: {
        query: '',
        pagenum: '1',
        pagesize: '10'
      },
      // 商品列表数组
      goodsList: [],
      // 总数据条数
      total: ''
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(this.meta.msg)
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
    },
    // 当前的页码发生变化时调用
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getGoodsList()
    },
    // 每页显示的数据条数改变时调用
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getGoodsList()
    },
    // 删除商品时调用的方法
    deleteGoods(goodsInfo) {
      this.$confirm('确定永久删除这条商品信息吗？', '提示', {
        confimrButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async con => {
          const { data: res } = await this.$http.delete(
            'goods/' + goodsInfo.goods_id
          )
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.getGoodsList()
          // console.log(this)
        })
        .catch(can => {
          this.$message.info('您取消了此次删除操作')
        })
    },
    // 点击添加商品按钮时会调用
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="stylus" scoped></style>
