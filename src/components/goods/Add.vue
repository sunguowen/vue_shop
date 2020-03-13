<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片展示区域 -->
    <el-card>
      <el-row>
        <el-alert
          title="添加商品信息"
          type="info"
          center
          show-icon
          :closable="false"
        ></el-alert>
      </el-row>
      <el-row>
        <!-- 步骤条 -->
        <el-steps :active="activeStep - 0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
      </el-row>
      <!-- tab面板区域 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeStep"
          tab-position="left"
          :before-leave="beforeTabsLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addGoodsForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addGoodsForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodsForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="props"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 表单的动态参数面板 -->
            <el-form-item
              :key="item.attr_id"
              v-for="item in manyTableData"
              :label="item.attr_name"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(item2, index2) in item.attr_vals"
                  :key="index2"
                  :label="item2"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 商品静态属性 -->
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action是图片要上传到的后台接口 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addGoodsForm.goods_introduce"
              :options="editorOption"
              @blur="onEditorBlur($event)"
              @focus="onEditorFocus($event)"
              @ready="onEditorReady($event)"
            />
            <!-- 添加商品的按钮 -->
            <el-button type="primary" style="marginTop: 20px" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片的对对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <span>
        <img :src="previewPath" style="width:100%" />
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 完成的步骤的索引
      activeStep: '0',
      // 添加商品的表单数据对象
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单验证规则
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '商品价格不能为空', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '商品数量不能为空', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '商品重量不能为空', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '您没有选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数组
      cateList: [],
      // 级联选择器的配置
      props: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 图片上传的URL地址,后台接口地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片需要的url路径
      previewPath: '',
      // 预览图片对话框的可见性控制
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(
          '获取商品分类信息失败，这将导致分类选择框无法正常使用'
        )
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择框状态发生变化时触发
    handleChange() {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    // 在tab页切换之前调用
    beforeTabsLeave(activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类数据。')
        return false
      }
    },
    // 当tab标签页切换时调用这个函数
    async tabClick() {
      if (this.activeStep === '1') {
        const { data: res } = await this.$http.get(
          'categories/' + this.cateID + '/attributes',
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeStep === '2') {
        const { data: res } = await this.$http.get(
          'categories/' + this.cateID + '/attributes',
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 上传图片点击预览时会触发这个函数
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file)
      const filePath = file.response.data.tmp_path
      const index = this.addGoodsForm.pics.findIndex(x => x.pic === filePath)
      this.addGoodsForm.pics.splice(index, 1)
    },
    // 图片上传组件上传成功的钩子函数
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addGoodsForm.pics.push(picInfo)
      // console.log(this.addGoodsForm)
    },
    // 添加商品的方法
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单数据验证未通过！请检查')
        }
        // 执行添加的业务逻辑
        const newAddGoodsForm = _.cloneDeep(this.addGoodsForm)
        newAddGoodsForm.goods_cat = newAddGoodsForm.goods_cat.join(',')
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addGoodsForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addGoodsForm.attrs.push(newInfo)
        })
        newAddGoodsForm.attrs = this.addGoodsForm.attrs
        // console.log(newAddGoodsForm)
        const { data: res } = await this.$http.post('goods', newAddGoodsForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateID() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 25px;
}
.el-tabs {
  margin-top: 20px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
</style>
