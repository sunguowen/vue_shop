<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="boox-card">
      <!-- 添加商品行 -->
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="showAddGoodsCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品分类列表 -->
      <tree-table
        class="tableTop"
        :columns="goodsCateTableColumns"
        :data="goodsCateList"
        :row-key="goodsCateList.cat_id"
        show-index
        index-text="序号"
        :stripe="true"
        :border="true"
        tree-type
        children-prop="children"
        :selection-type="false"
        :expand-type="false"
      >
        <template slot="isUse" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success iconsuccess"
          ></i>
          <i v-else class="el-icon-error iconerror"></i>
        </template>
        <template slot="sortCate" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="operation" slot-scope="scope">
          <!-- {{scope.row.cat_id}} -->
          <el-button
            type="primary"
            size="small"
            @click="showModifyDialog(scope.row)"
          >
            <i class="el-icon-edit"></i>编辑
          </el-button>
          <el-button type="danger" size="small" @click="deleteCate(scope.row)">
            <i class="el-icon-delete"></i>删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页数据 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsCateTotal"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      @close="addGoodsCateDialogClosed"
      title="添加分类"
      :visible.sync="addGoodsCateDialogVisible"
      width="50%"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRoles"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            clearable
            v-model="selectKeys"
            :options="firstAndSecondCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGoodsCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGoodsCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类信息对话框 -->
    <el-dialog
      title="修改分类信息"
      :visible.sync="modifyCateDialogVisible"
      width="50%"
      @close="modifyCateDialogClose"
    >
      <el-form
        :model="modifyCateForm"
        :rules="modifyCateFormRules"
        ref="modifyCateFormRef"
        label-width="100px"
      >
        <el-form-item label="新分类名称" prop="cat_name">
          <el-input v-model="modifyCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求信息
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      goodsCateList: [],
      // 商品分类总条数
      goodsCateTotal: 0,
      // 商品分类表格的列配置
      goodsCateTableColumns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isUse' },
        { label: '排序', type: 'template', template: 'sortCate' },
        { label: '操作', type: 'template', template: 'operation' }
      ],
      // 控制添加分类对话框的可见性的变量
      addGoodsCateDialogVisible: false,
      // 添加分类的表单
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 一二级分类数据
      firstAndSecondCateList: [],
      addCateFormRoles: {
        cat_name: [
          { required: true, message: '请填写分类名称', trigger: 'blur' }
        ]
      },
      // 级联选项的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选中的值
      selectKeys: [],
      // 修改分类对话框的可见性
      modifyCateDialogVisible: false,
      modifyCateForm: {
        cat_name: ''
      },
      modifyCateFormRules: {
        cat_name: [
          { required: true, message: '请填写新的分类名称', trigger: 'blur' }
        ]
      },
      // 待修改的分类的id
      modifyCateID: ''
    }
  },
  created() {
    this.getGoodsCateList()
  },
  methods: {
    async getGoodsCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.goodsCateList = res.data.result
      this.goodsCateTotal = res.data.total
    },
    editGoodsCate(cateInfo) {
      // console.log(cateInfo.cat_id)
    },
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getGoodsCateList()
      // console.log(newPageSize)
    },
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getGoodsCateList()
    },
    // 展示添加分类对话框
    showAddGoodsCateDialog() {
      this.getGoodsCateListFS()
      this.addGoodsCateDialogVisible = true
    },
    // 获取一二级分类数据
    async getGoodsCateListFS() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      // console.log(res.data)
      this.firstAndSecondCateList = res.data
    },
    // x选择项发生变化触发这个函数
    parentCateChange() {
      console.log(this.selectKeys)
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCateForm.cat_level = this.selectKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      console.log(this.addCateForm.pid, this.addCateForm.cat_level)
    },
    async addGoodsCate() {
      const { data: res } = await this.$http.post(
        'categories',
        this.addCateForm
      )
      console.log(res)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getGoodsCateList()
      this.addGoodsCateDialogVisible = false
    },
    addGoodsCateDialogClosed() {
      console.log('我清空了表单数据')
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示修改对话框
    showModifyDialog(cateInfo) {
      this.modifyCateID = cateInfo.cat_id
      this.modifyCateDialogVisible = true
    },
    // 修改分类
    modifyCate() {
      this.$refs.modifyCateFormRef.validate(async valid => {
        if (!valid) this.$message.error('表单内容验证未通过')
        const { data: res } = await this.$http.put(
          'categories/' + this.modifyCateID,
          this.modifyCateForm
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getGoodsCateList()
        this.modifyCateDialogVisible = false
      })
    },
    modifyCateDialogClose() {
      this.$refs.modifyCateFormRef.resetFields()
    },
    deleteCate(cateInfo) {
      this.$confirm('确定永久删除当前商品分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async conf => {
          const { data: res } = await this.$http.delete(
            'categories/' + cateInfo.cat_id
          )
          if (res.meta.status !== 200) return this.$message.error('删除失败')
          this.$message.success(res.meta.msg)
          this.getGoodsCateList()
        })
        .catch(value => {
          this.$message.info('您取消了删除操作')
        })
      // console.log(confirmResult)
    }
  }
}
</script>

<style lang="less" scoped>
.tableTop {
  margin-top: 20px;
}
.iconerror {
  color: red;
  font-size: 20px;
}
.iconsuccess {
  color: green;
  font-size: 20px;
}
.el-cascader {
  width: 100%;
}
.el-cascader-menu {
  height: 300px !important;
}
</style>
