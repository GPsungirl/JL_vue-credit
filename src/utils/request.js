import axios from 'axios'
import { getToken } from './auth.js'
import router, { resetRouter } from './../router'
import store from './../store'
import  Message  from 'element-ui'
import {
  removeToken
} from './auth'
import { setToken } from './auth';
// create类似于我们常看到的new Object一样
const service = axios.create({
  baseURL: '', // baseurl为什么是''呢？看我下面的解释
  // withCredentials: true,

  // timeout: 200000
})

// 请求拦截
service.interceptors.request.use(
  config => {

    //config.headers['Authorization'] = getToken()
    // }
    return config
  },
  error => {
    // console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截
service.interceptors.response.use(
  response => {

    if (response.data.code === '0000') {

      const authorization = 'jiade'; //response.config.headers.Authorization || response.headers.authorization ; // ''
      //console.log(authorization)
      //debugger
      store.commit('user/SET_TOKEN', authorization) //请求用户信息
      setToken(authorization) // 存到cookie里面
      return response
    } else if (response.data.code == 2000 || response.data.message == 'Token已过期') {  // token 过期处理
      // 目前后端的 token过期 直接以接口错误的方式 抛出来了，所以这里接收不到了。。无奈

      Message.MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
            confirmButtonText: '重新登录',
            // cancelButtonText: '取消',
            type: 'warning'
      }).then(() => {

            localStorage.removeItem('pp_userId')
            localStorage.removeItem('pp_merchant_center_code')
            store.commit('user/SET_TOKEN', '')
            store.commit('user/SET_ROLES', [])
            store.commit('user/SET_USERID', '')
            store.commit('user/SET_AVATAR', '')
            store.commit('user/SET_NAME', '')
            store.commit('user/SET_MERCHANT_CENTER_CODE','')
            Message.error('token过期')
            removeToken()
            resetRouter()
            router.push(`/login`)
            location.reload()
      })
    } else {
      return response;
    }
    return response;
  },
  error => {//目前的token过期 以接口错误的时候 抛出来了，这里拦截

    // if(error.response.data.code == 2000){

    //   Message.MessageBox.alert('登录超时请重新登录', '确定登出', {
    //     confirmButtonText: '重新登录',
    //     center:true,
    //     type: 'warning'
    //   }).then(() => {

    //     localStorage.removeItem('pp_userId')
    //     localStorage.removeItem('pp_merchant_center_code')
    //     store.commit('user/SET_TOKEN', '')
    //     store.commit('user/SET_ROLES', [])
    //     store.commit('user/SET_USERID', '')
    //     store.commit('user/SET_AVATAR', '')
    //     store.commit('user/SET_NAME', '')
    //     store.commit('user/SET_MERCHANT_CENTER_CODE','')
    //     // Message.error('token过期')
    //     removeToken()
    //     resetRouter()
    //     router.push(`/login`)
    //     //location.reload()
    //   })
    // }
    // console.error('假如你能在控制台看到此话，代表跟我配合的那个后端：1、网断了2、接口异常了3、屏幕黑了')
    return Promise.reject(error)
  }
)
export default service
