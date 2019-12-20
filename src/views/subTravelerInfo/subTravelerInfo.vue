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
                <!-- <el-table-column prop="" label="操作" width="140">
                  <template slot-scope="scope">
                    <el-button @click="makeCodeImg(scope.row)" type="text" size="small">生成二维码</el-button>
                  </template>
                </el-table-column> -->

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


    </div>
</template>
<script>
import commonUrl from '../../utils/common';

export default {
    name: 'subTravelerInfo',
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
              // 客户类型
              type:'1',
              user_type:'1',
              // 用户名
              user_name:'',
              // 手机号
              phone:'',
            },
            // 弹框
            add_loading:false,
            add_dialog: false,
        }
    },
    created(){
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
                    type:this.queryForm.type,
                    user_type:this.queryForm.user_type,
                    user_name:this.queryForm.user_name,
                    phone:this.queryForm.phone,

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

        // 新增按钮 业务人员
        handle_add(){
            this.add_dialog = true

            // 清空 数据
            this.resetData('add_formInline')
            // this.clear_formData();
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
            this.$refs[formName].resetFields();

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
