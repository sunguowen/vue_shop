<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-alert title="注意：只允许选择第三级商品分类数据。" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框的位置 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="goodsCateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab选项卡区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col :span="6">
              <el-button
                @click="addDialogVisible = true"
                type="primary"
                :disabled="isBtnDisabled"
              >添加参数</el-button>
            </el-col>
          </el-row>
          <!-- 动态参数表格 -->
          <el-table :data="manyParamsData" border stripe :default-expand-all="true">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row>
                  <el-tag
                    :key="index"
                    v-for="(item , index) in scope.row.attr_vals.split(',')"
                    closable
                    :disable-transitions="false"
                    @close="deleteVal(scope.row)"
                  >{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="inputVisible"
                    v-model="inputValue"
                    ref="onlyTagInputRef"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col :span="6">
              <el-button
                @click="addDialogVisible = true"
                type="primary"
                :disabled="isBtnDisabled"
              >添加属性</el-button>
            </el-col>
          </el-row>
          <!-- 静态属性的表格 -->
          <el-table :data="onlyParamsData" border stripe :default-expand-all="true">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row>
                  <el-tag
                    :key="index"
                    v-for="(item , index) in scope.row.attr_vals.split(',')"
                    closable
                    :disable-transitions="true"
                    @close="deleteVal(scope.row , index)"
                  >{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="inputVisible"
                    v-model="inputValue"
                    ref="onlyTagInputRef"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="addDialogTitleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="addDialogInputText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数的对话框 -->
    <el-dialog
      :title="editDialogTitleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="addDialogInputText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类信息列表
      goodsCateList: [],
      // 配置级联选择框的对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数的数组
      manyParamsData: [],
      // 静态属性的数组
      onlyParamsData: [],
      // 添加属性对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单
      addForm: {
        attr_name: '',
        attr_sel: '',
        attr_vals: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请填写属性或参数的名称', trigger: 'blur' }
        ]
      },
      // 控制编辑对话框的可见性
      editDialogVisible: false,
      // 编辑参数的表单参数
      editForm: {
        attr_name: ''
      },
      // 属性/参数的id
      attrID: '',
      // --------------- tagDataArea-----------------//
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    this.getGoodsCateList()
  },
  methods: {
    async getGoodsCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      this.goodsCateList = res.data
    },
    // 级联选择框变化会触发这个函数
    handleChange() {
      this.getParamsData()
    },
    // tab页签的点击页签处理
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数数据
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return false
      }
      // 通过选择的发起请求
      const { data: res } = await this.$http.get(
        'categories/' + this.cateID + '/attributes',
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      if (this.activeName === 'many') {
        this.manyParamsData = res.data
        console.log(this.manyParamsData)
      } else {
        this.onlyParamsData = res.data
        console.log(this.onlyParamsData)
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('表单验证未通过')
        const { data: res } = await this.$http.post(
          'categories/' + this.cateID + '/attributes',
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 显示编辑参数对话框
    async showEditDialog(attrInfo) {
      this.attrID = attrInfo.attr_id
      const { data: res } = await this.$http.get(
        'categories/' + this.cateID + '/attributes/' + this.attrID
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm.attr_name = res.data.attr_name
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('表单域验证失败')
        const { data: res } = await this.$http.put(
          'categories/' + this.cateID + '/attributes/' + this.attrID,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 删除参数值
    deleteParams(attrInfo) {
      this.$confirm('确定要永久删除这个参数项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async confirm => {
          const { data: res } = await this.$http.delete(
            'categories/' + this.cateID + '/attributes/' + attrInfo.attr_id
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除操作失败')
          }
          this.$message.success(res.meta.msg)
          this.getParamsData()
        })
        .catch(cancel => {
          this.$message.info('取消了本次删除操作')
        })
    },
    // --------------tagMethodsArea-------------//
    async handleInputConfirm(attrInfo) {
      // console.log(attrInfo)
      this.inputVisible = false
      if (this.$refs.onlyTagInputRef.value === '') {
        return this.$message.error('新标签值为空添加失败。')
      }
      const { data: res } = await this.$http.put(
        `categories/${this.cateID}/attributes/${attrInfo.attr_id}`,
        {
          attr_name: attrInfo.attr_name,
          attr_sel: this.activeName,
          attr_vals: `${attrInfo.attr_vals},${this.inputValue}`
        }
      )
      // console.log(res.meta)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      // 此处需要解决刷新闪动问题
      this.getParamsData()
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.onlyTagInputRef.$refs.input.focus()
      })
    },
    async deleteVal(attrInfo, index) {
      var newArr = attrInfo.attr_vals.split(',')
      newArr.splice(index, 1)
      var valStr = newArr.join(',')
      const { data: res } = await this.$http.put(
        `categories/${this.cateID}/attributes/${attrInfo.attr_id}`,
        {
          attr_name: attrInfo.attr_name,
          attr_sel: this.activeName,
          attr_vals: valStr
        }
      )
      // console.log(res.meta)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      // 此处需要解决刷新闪动问题
      this.getParamsData()
      console.log(valStr)
      console.log(attrInfo, index)
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    // 当前选中的三级分类的id
    cateID() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算添加属性对话框的标题
    addDialogTitleText() {
      if (this.activeName === 'many') {
        return '添加动态参数'
      }
      return '添加静态属性'
    },
    // 动态计算表单前提示文字
    addDialogInputText() {
      if (this.activeName === 'many') {
        return '参数名称'
      }
      return '属性名称'
    },
    editDialogTitleText() {
      if (this.activeName === 'many') {
        return '编辑动态参数'
      }
      return '编辑静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 15px 0;
}
// ------------tagStyle----------//
.el-tag + .el-tag {
  margin-left: 10px;
  margin-top: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
