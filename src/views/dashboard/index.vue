<template>
  <div class="dashboard-container">
    <!-- <p class="title" style="margin-top:10%;">
      <span>{{name}}</span>，
      欢迎登陆角落里向导系统，您的ID为
      <span>{{customid}}</span>
    </p>
    <p class="title">您昨日的平台收益为</p>
    <p class="title t_profit">
      <span>贝壳收益：</span>
      {{yesterday_virtualamount}} 贝壳
    </p>
    <p class="title t_profit">
      <span>出行收益：</span>
      {{yesterday_accountamount}} 元
    </p>
    <p class="title t_profit">
      <span>关注人数：</span>
      {{countFocus}} 人
    </p> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import commonUrl from "../../utils/common";
import qs from "qs";
import { setTimeout } from "timers";
export default {
  name: "Dashboard",
  data() {
    return {
      name: localStorage.getItem("pp_real_name"),
      customid: localStorage.getItem("pp_userId"),
      // 昨日收益
      yesterday_virtualamount: "",
      yesterday_accountamount: "",
      // 关注人数
      countFocus:''
    };
  },
  created() {
    // 拿到name customid
    //console.log(this.name)
    //console.log(this.customid);
    // 初始化数据
    //this.getData();
  },
  computed: {
    ...mapGetters(["roles"])
  },
  methods: {
    // 用户信息
    getUserInfo() {},
    // 初始化数据
    getData() {
      // 机构信息
      let _param1 = {
        data: {
          // customid:'100064',
          // yesterDay:'20190918'
          customid: this.customid,
          yesterDay: this.getYestoday()
        }
      };
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      this.$http
        .post(
          `${commonUrl.baseUrl}/customAccount/selectYesterDayTotal`,
          _param1
        )
        .then(res => {
          console.log(res);

          if (res.data.code == "0000") {
            const yest_account = res.data.data.customAccount;
            const yest_virtual = res.data.data.customVirtualAccount;
            // 昨日出行
            if (yest_account.accountDayTotal == null) {
              this.yesterday_accountamount = 0;
            } else {
              this.yesterday_accountamount = yest_account.accountDayTotal;
            }
            // 昨日贝壳
            if (yest_virtual.virtual_day_total == null) {
              this.yesterday_virtualamount = 0;
            } else {
              this.yesterday_virtualamount = yest_virtual.virtual_day_total;
            }
            // 关注人数
            this.countFocus = res.data.data.customFocusDomin.countFocus;
            loading.close();
          } else {
            this.m_message(res.data.msg, "warning");
            loading.close();
          }
        })
        .catch(err => {
          console.log(err);
          loading.close();
        });
    },

    // 获取 昨日 日期
    getYestoday() {
      var day1 = new Date();
      day1.setTime(day1.getTime() - 24 * 60 * 60 * 1000);
      var _month =
        day1.getMonth() + 1 < 10
          ? "0" + (day1.getMonth() + 1)
          : day1.getMonth() + 1;
      var _date = day1.getDate() < 10 ? "0" + day1.getDate() : day1.getDate();
      var s1 = day1.getFullYear() + "" + _month + "" + _date;
      return s1;
    },
    // 获取 上月
    getLastMonth() {
      /*默认显示上个月的日期*/
      var nowdays = new Date();
      var year = nowdays.getFullYear();
      var month = nowdays.getMonth();
      if (month == 0) {
        month = 12;
        year = year - 1;
      }
      if (month < 10) {
        month = "0" + month;
      }
      var firstDay = year + month;
      return firstDay;
    },
    // 提示信息 message:提示信息   type 提示类型
    m_message(message, type) {
      this.$message({
        message,
        type
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
  .font14 {
    font-size: 12px;
  }
}
.main_content {
  margin-top: 40px;
}
.title {
  color: #666;
  text-align: left;
  line-height: 30px;
  width: 500px;
  margin: auto;
}
.title.t_profit {
  padding-left: 75px;
}
.title span {
  color: #000;
}
</style>
<style scoped>
.box .myBtn {
  color: gray;
  background: gray;
}
</style>
