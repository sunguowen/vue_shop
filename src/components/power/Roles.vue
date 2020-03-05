<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片展示区 -->
    <el-card class="box-card">
      <!-- 添加用户区 -->
      <el-row>
        <el-col :span="6">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表表格 -->
      <el-table :data="rolesList" style="width: 100%" :border="true" :stripe="true">
        <el-table-column type="expand">
          <!-- 展开之后的模板 -->
          <template slot-scope="scope">
            <el-row
              :class="['vcenter','bdbottom' , index1 === 0 ? 'bdtop' : '']"
              v-for="(item1 , index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightByID(scope.row , item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级 -->
              <el-col :span="19">
                <!-- 通过循环渲染二级权限 -->
                <el-row
                  :class="['vcenter', index2 === 0 ? '':'bdtop']"
                  v-for="(item2 , index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightByID(scope.row , item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 循环渲染三级权限 -->
                    <el-tag
                      type="warning"
                      closable
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      @close="removeRightByID(scope.row , item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" label="行号" width="60px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      ref="setRightDialogRef"
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :default-expand-all="true"
        :default-checked-keys="[]"
        :data="rightsList"
        show-checkbox
        ref="rightTreeRef"
        node-key="id"
        :props="rightsListProps"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色ID
      rolesID: '',
      // 所有角色的列表
      rolesList: [],
      // 所有权限的列表
      rightsList: [],
      // 当前角色拥有的第三级权限的ID
      selectedRightList: [],
      rightsListProps: {
        children: 'children',
        label: 'authName'
      },
      setRightDialogVisible: false
    }
  },
  created () {
    this.getRolesList()
    this.getRightsList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      this.rolesList = res.data
      // console.log(res)
    },
    // 根据角色和权限双ID删除某一权限
    async removeRightByID (role, rightID) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除操作。')
      const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + rightID)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      role.children = res.data
      // this.getRolesList()
      // console.log(confirmResult)
    },
    // 展示分配权限的对话框
    showSetRightDialog (rolesInfo) {
      this.rolesID = rolesInfo.id
      // this.selectedRightList = []
      this.getRightsId(rolesInfo.children)
      this.setRightDialogVisible = true
      var that = this
      this.$nextTick(() => {
        this.$refs.rightTreeRef.setCheckedKeys(that.selectedRightList)
      })
      console.log(this.selectedRightList)
    },
    // 获取所有权限列表
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
      // console.log(this.rightsList)
      // console.log(this.rolesList)
    },
    // 递归获取到当前角色所拥有的第三级权限
    getRightsId (rightsInfo) {
      for (var i = 0; i < rightsInfo.length; i++) {
        if (rightsInfo[i].children) {
          this.getRightsId(rightsInfo[i].children)
        } else {
          this.selectedRightList.push(rightsInfo[i].id)
        }
      }
    },
    setRightDialogClose () {
      this.selectedRightList = []
    },
    async allotRights () {
      const keys = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idString = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.rolesID}/rights`, { rids: idString })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px 5px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
