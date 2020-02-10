<template>
    <!-- 业务人员 页面 -->
    <div class="pad_5">
        <!-- M1 查询区域 -->
        <div class="query_fields pad_b_no handle_timerange">
            <el-form :inline="true" :model="queryForm" ref="queryForm" size="mini" class="demo-form-inline">
                <!-- 客户类型 -->
                <!-- <el-form-item label="客户类型" prop="user_type" label-width="68px">
                    <el-select v-model="queryForm.user_type" placeholder="请选择客户类型" class="wid_140">
                    <el-option
                        v-for="(item, index) of queryForm.user_types"
                        :key="index"
                        :label="item.value"
                        :value="item.id"
                        >
                    </el-option>
                    </el-select>
                </el-form-item> -->
                <!-- 用户名-->
                <el-form-item label="用户名" prop="user_name" label-width="68px">
                    <el-input v-model="queryForm.user_name" placeholder="请输入用户名" class="wid_140"></el-input>
                </el-form-item>
                <!-- 手机号 -->
                <el-form-item label="手机号" prop="phone" label-width="68px">
                  <el-input v-model="queryForm.phone" placeholder="请输入手机号" class="wid_140"></el-input>
                </el-form-item>
                <!-- 查询 -->
                <el-form-item>
                    <el-button type="primary" size='mini' @click="queryData">查询</el-button>
                    <el-button type="success" size='mini' @click="resetData('queryForm')">重置</el-button>
                    <el-button type="primary" size='mini' @click="handle_refresh">刷新</el-button>
                    <el-button type="success" size='mini' @click="handle_add">新增业务人员</el-button>

                </el-form-item>
            </el-form>
        </div>
        <!-- M2 主列表 -->
        <div>
            <!-- 表格 -->
            <el-table :data="tableData" v-loading="tableLoading" border stripe style="width: 100%">

                <el-table-column prop="user_name" label="名称" width="">
                </el-table-column>
                <el-table-column prop="phone" label="电话" width="">
                </el-table-column>
                <!-- 上级ID -->
                <el-table-column prop="up_userid" label="上级ID" width="">
                </el-table-column>
                <!-- 操作 -->
                <el-table-column prop="" label="操作" width="140">
                  <template slot-scope="scope">
                    <el-button @click="makeCodeImg(scope.row)" type="text" size="small">生成二维码</el-button>
                  </template>
                </el-table-column>

            </el-table>
            <!-- 分页 -->
            <div class="block mar_t10">
                <el-pagination
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :total="pageTotal"
                background
                layout="total, prev, pager, next, jumper"
                >
                </el-pagination>
            </div>
        </div>
         <!-- M3 dialog 新增-->
        <el-dialog
            title="新增业务人员"
            :visible.sync="add_dialog"
            width="30%"
            center
            class="valid_form"
            v-loading="add_loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            >
            <!-- body -->
            <div class="wid_b75">
                <el-form  :model="add_formInline" :rules="rules" ref="add_formInline" label-width="50px"  class="demo-ruleForm">
                    <el-form-item label="姓名" prop="user_name">
                        <el-input v-model="add_formInline.user_name" placeholder="请输入姓名"></el-input>
                    </el-form-item>
                    <el-form-item label="电话" prop="phone">
                        <el-input v-model="add_formInline.phone"  placeholder="请输入电话"></el-input>
                    </el-form-item>
                </el-form>
            </div>
             <!-- footer  -->
            <span slot="footer" class="dialog-footer">
            <el-button @click="add_dialog = false" size='mini'>取 消</el-button>
            <el-button type="primary" @click="save_add" size='mini'>确 定</el-button>
            </span>
        </el-dialog>
        <!-- M4 dialog 二维码 -->
        <el-dialog
          title="二维码"
          :visible.sync="view_dialog"
          width="30%"
          center
          v-loading="view_loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          class="erCode"
          >

          <img width="218px"  :src="viewImageUrl" alt="">

          <!-- footer -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="view_dialog = false" size='mini'>取 消</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
import commonUrl from '../../utils/common';

export default {
    name: 'virtualProfit',
    data(){
        // 手机号验证
        let validMobile=(rule,value,callback)=>{
            if(value==''||value==undefined){
                callback()
            }else{
                let reg=/^1[3|4|5|7|8][0-9]\d{8}$/
                if(!reg.test(value)){callback(new Error('请输入正确手机号'))}else{
                    callback()
                }
            }
        };
        return {

            //name:localStorage.getItem('pp_real_name'),
            userId:localStorage.getItem('pp_userId'),
            // 主列表
            tableLoading:false,
            tableData:[],
            // 分页
            pageTotal: 1,
            currentPage:1,
            // 查询参数
            queryForm: {
              // 客户类型 1 客户 2 业务员
              user_types:[
                  {
                      id:'1',
                      value:'客户'
                  },
                  {
                      id:'2',
                      value:'业务员'
                  }
              ],
              // 客户类型 1客户2业务
              user_type:'2',
              // 用户名
              user_name:'',
              // 手机号
              phone:'',
              up_userid:''
            },
            // 弹框
            add_loading:false,
            add_dialog: false,
            // 新增数据
            add_formInline: {
              user_name: '',
              phone: '',
              up_userid:'',
              // 1扫码 2直接手动填写
              type:'2',
              //user_type 1为用户2位业务员(因为后台共用一个表)
              user_type:'2'
            },
            rules: {
                user_name: [

                    { required: true, message:'请输入姓名', trigger: 'blur' }
                ],
                phone: [
                    { required: true, validator: validMobile, trigger: 'blur' }
                ],
                // email: [
                //     { required: true, message:'请输入邮箱', trigger: 'blur' }
                // ],
                // region: [
                //     { required: true, message:'请选择业务区域', trigger: 'change' }
                // ]
            },
            //生成二维码
            view_dialog:false,
            view_loading:false,
            viewImageUrl:'',
        }
    },
    created(){
        // 保存admin_id
        this.queryForm.up_userid = localStorage.getItem('pp_userId')
        this.add_formInline.up_userid = localStorage.getItem('pp_userId')
        // 初始化主列表
        this.getTabelDataList(1)
    },
    methods:{
        // 初始化主列表
        getTabelDataList(pageNum){
            // 参数
            let param = {
                data: {
                    // // 公有
                    // customid: this.customid,
                    page_count: 10,
                    page_num: pageNum,
                    // 私有
                    user_type:this.queryForm.user_type,
                    user_name:this.queryForm.user_name,
                    phone:this.queryForm.phone,
                    up_userid:this.queryForm.up_userid
                }
            }
            this.tableLoading = true
            this.$http.post(`${ commonUrl.baseUrl }/api/register/selectSysUserInfo`, param).then(res=>{
                if(res.data.code == '0000'){
                    this.tableData =  res.data.data.sysUserInfos
                    // 分页 总数
                    this.pageTotal = res.data.page.page_total;
                    // 关闭加载
                    this.tableLoading = false
                }
            }).catch(err=>{})
        },
        // 生成二维码--操作操作
        makeCodeImg(row){

          let param = {
            data:{

              userId:row.user_id
            }
          }
          this.view_dialog = true
          this.view_loading = true
          this.$http.post(`${ commonUrl.baseUrl }/api/register/getQRCode`, param,{responseType: "arraybuffer"}).then(response=>{
              
              console.log(new Uint8Array(response.data))
              //将从后台获取的图片流进行转换
              return 'data:image/png;base64,' + btoa(
                new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
              );

          }).then(res=>{
            this.viewImageUrl = res
            this.view_loading = false
            }).catch(err=>{})
        },
        // 新增业务人员---操作
        handle_add(){
            this.add_dialog = true
            // 清空 数据
            this.resetData('add_formInline')
            // this.clear_formData();
        },
        // 保存 新增
        save_add(){
            // 验证
            if(this.valid_form('add_formInline')){
              // 参数
              let param = {
                  data: {
                      // 公有
                      // signInUserId: this.$store.getters.userId,
                      // signInRoleId: this.$store.getters.roleId,
                      // 私有
                      phone:this.add_formInline.phone,
                      user_name:this.add_formInline.user_name,
                      up_userid:this.add_formInline.up_userid,
                      // 1扫码 2直接手动填写则是业务人员
                      type:this.add_formInline.type,
                      //user_type 1用户2:业务员(因为后台共用一个表)
                      user_type:this.add_formInline.user_type

                  }
              }
              this.add_loading = true
              this.$http.post(`${ commonUrl.baseUrl }/api/register/addUserInfo`, param).then(res=>{
                  if(res.data.code == '0000'){
                      console.log(res)

                      this.add_loading = false
                      // 关闭弹框
                      this.add_dialog = false
                      // 提示 新增成功
                      this.m_message(res.data.msg, 'success')
                      // 加载数据列表
                      this.getTabelDataList(1)
                  }
              }).catch(err=>{

              })
            }
        },
        // 刷新
        handle_refresh(){
            this.getTabelDataList(1)
            this.currentPage = 1
        },
        // 查询按钮
        queryData(){
          this.getTabelDataList(1);
        },
        // 重置按钮
        resetData(formName){
          if(this.$refs[formName]){
              this.$refs[formName].resetFields();
          }
        },
        // 分页
        handleCurrentChange(val){
            this.currentPage = val
            // 获取单前页数据列表
            this.getTabelDataList(val);
            //console.log(`当前页: ${val}`);
        },
         // 提示信息 message:提示信息   type 提示类型
        m_message(message,type){
            this.$message({
                message,
                type
            })
        },
         // 校验规则
        valid_form(formName) {
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
    }
}
</script>
<style >
  .erCode .el-dialog__body{
    text-align:center;
  }
</style>
