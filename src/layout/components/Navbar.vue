<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <!-- 用户名 -->

        <div class="avatar-wrapper">

          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">退出</span>
          </el-dropdown-item>
          <!-- 修改密码 -->
          <!-- <el-dropdown-item divided>
            <span @click="modi_password" style="display:block;" >修改密码</span>
          </el-dropdown-item> -->
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 用户名 -->
    <div class="right-menu real_name">
      <span>{{ $store.getters.real_name}}</span>
    </div>
    <!-- 修改密码dialog -->
    <el-dialog
      title="修改密码"
      :visible.sync="modi_dialogVisible"
      width="30%"
      class=""
      center
      :close-on-click-modal="false"
      v-loading="modi_loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      >
      <!-- 修改内容 -->
      <el-form ref="modi_form" :model="modi_form" :rules="modi_form_rules" label-width="80px" class="valid_form">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="modi_form.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="modi_form.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="newPassword2">
          <el-input type="password" v-model="modi_form.newPassword2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button @click="modi_dialogVisible = false" size="mini">取 消</el-button>
          <el-button type="primary"   @click="save_modi" size="mini">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { removeToken } from './../../utils/auth'
import { resetRouter } from './../../router'
import commonUrl from '../../utils/common';

export default {
  data(){
    return{
      customid:localStorage.getItem('pp_userId'),
      modi_dialogVisible:false,
      modi_loading:false,
      modi_form:{
        oldPassword:'',
        newPassword:'',
        newPassword2:'',
      },
      modi_form_rules:{
        oldPassword:[
          { required: true, message: '请输入原密码', trigger: 'blur' },
        ],
        newPassword:[
          { required: true, message: '请输入新密码', trigger: 'blur' },
        ],
        newPassword2:[
          { required: true, message: '请确认密码', trigger: 'blur' },
        ]
      },
    }
  },
  created(){

  },
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'real_name'
    ])
  },

  methods: {
    // 修改密码
    modi_password(){
      this.modi_dialogVisible = true
      // 重置
      this.resetData('modi_form')
    },

    // 重置查询条件
    resetData(formName){
      if(this.$refs[formName]){
        this.$refs[formName].resetFields();
      }
    },
    // 保存密码修改
    save_modi(){
      // 先校验再提交
      if(this.m_valid_addForm('modi_form')){
        // 判断两次密码是否一致
        if(this.modi_form.newPassword == this.modi_form.newPassword2){
          let param = {
            data:{
              // 公参
              username:this.customid,
              // 私参
              oldpassword:this.$md5(this.modi_form.oldPassword),
              newpassword:this.$md5(this.modi_form.newPassword),
            }
          }
          this.modi_loading = true
          this.$http.post(`${ commonUrl.baseUrl }/traveler/updatePassWord`, param).then(res=>{
            if(res.data.code == '0000'){
              // console.log(res)


              // debugger
              this.modi_loading = false
              this.m_message(res.data.msg, 'success')
              this.resetData('modi_form')
              this.modi_dialogVisible = false
            }else{
              this.modi_loading = false
              this.m_message(res.data.msg, 'warning')
              this.resetData('modi_form')
            }
          }).catch(err=>{})
        }else{
          this.m_message('输入的新密码不一致，请重新输入', 'warning')
          this.resetData('modi_form')
        }
      }

    },
    // 新增 校验规则
    m_valid_addForm(formName) {
        let  flag  = false ;
        this.$refs[formName].validate((valid) => {
            if (valid) {
            flag = true;
            return true
            } else {
            flag = false;
            return false;
            }
        });
        return flag;
    },
    // 提示信息 message:提示信息   type 提示类型
    m_message(message,type){
        this.$message({
            message,
            type
        })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    logout() {
      localStorage.removeItem('pp_userId')
      this.$store.commit('user/SET_TOKEN', '')
      this.$store.commit('user/SET_ROLES', [])
      this.$store.commit('user/SET_USERID', '')
      this.$store.commit('user/SET_AVATAR', '')
      this.$store.commit('user/SET_NAME', '')
      removeToken()
      resetRouter()
      this.$router.push(`/login`)
    }
  }
}
</script>

<style lang="scss" scoped>
.real_name{
  margin-right:6px;
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
