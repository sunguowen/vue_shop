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
        <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
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
      >
        <el-tabs v-model="activeStep" tab-position="left" style="height: 200px;">
          <el-tab-pane label="基本信息" name="0">基本信息区域</el-tab-pane>
          <el-tab-pane label="商品参数" name="1">配置管理</el-tab-pane>
          <el-tab-pane label="商品属性" name="2">角色管理</el-tab-pane>
          <el-tab-pane label="商品图片" name="3">定时任务补偿</el-tab-pane>
          <el-tab-pane label="商品内容" name="4">定时任务补偿</el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 完成的步骤的索引
      activeStep: '0',
      // 添加商品的表单数据对象
      addGoodsForm:{
      },
      // 添加商品表单验证规则
      addGoodsFormRules:{}
    }
  },
  created() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 25px;
}
.el-tabs {
  margin-top: 20px;
}
</style>
