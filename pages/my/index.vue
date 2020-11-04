<template>
<view class="container">
  <view class="userinfo">
    <open-data type="userAvatarUrl" class="userinfo-avatar"></open-data>
  </view>
  <gradePicker title="我当前的年级" icon="location-o" :grade="grade" :term="term" @change="changeGrade"></gradePicker>
  <van-cell is-link title="课程配置" icon="setting-o" link-type="navigateTo" url="/pages/subjectSetting/index"></van-cell>

  <van-dialog title="标题" message="需要授权用户信息" :show="show" show-cancel-button confirm-button-open-type="getUserInfo" @close="onClose" @getuserinfo="getUserInfo"></van-dialog>
  <van-popup :show="show" position="bottom" @close="onClose">
  <van-picker :columns="columns" show-toolbar @cancel="onClose" @confirm="onConfirm"></van-picker>
  </van-popup>
</view>
</template>

<script>
import gradePicker from '../../components/gradePicker/index'

const api = require('../../utils/api.js')

const app = getApp()

export default {
  data() {
    return {
      grade: '初三',
      term: '上学期',
      show: false,
    }
  },

  components: {
    gradePicker,
  },
  props: {},

  onLoad() {},

  onShow() {},

  methods: {
    onClose() {
      this.setData({
        show: false,
      })
    },

    getUserInfo(event) {
      if (!app.globalData.userInfo) {
        const detail = event.detail
        detail.userInfo.grade = this.grade
        detail.userInfo.term = this.term
        api.wxCloudCallFunction('addUser', {
          collectionName: 'users',
          ...detail,
        }).then(res => {
          app.globalData.userInfo = detail.userInfo
          this.saveCurrentGrade()
          console.log(res)
        })
      }

      console.log(event.detail)
    },

    changeGrade(evt) {
      const [grade, term] = evt.detail
      this.setData({
        grade,
        term,
      }, () => {
        if (!app.globalData.userInfo) {
          this.setData({
            show: true,
          })
        } else {
          this.saveCurrentGrade()
        }
      })
    },

    saveCurrentGrade() {
      const {
        grade,
        term,
      } = this
      api.wxCloudCallFunction('update', {
        collectionName: 'users',
        grade,
        term,
      }).then(res => {
        app.globalData.userInfo.grade = grade
        app.globalData.userInfo.term = term
        uni.showToast({
          title: '修改成功',
        })
      })
    },

    getDetail() {
      this.setData({})
    },

  },
}
</script>
<style>
.container{
  min-height: 100vh;
  overflow: hidden;
  background-image: url("https://cdn.it120.cc/apifactory/2019/03/07/1c731c0a355da6c7f0e163fa1917d4d3.png");
  background-position: 0 -128rpx;
  background-size: 750rpx auto,1500rpx, auto;
  background-repeat: no-repeat;
  background-color: #f8f8f8;
  color: #000;
}

.userinfo {
	display: flex;
	flex-direction: column;
	align-items: center;
  width: 750rpx;
  margin-top: 120rpx;
}
.userinfo-avatar {
	width: 154rpx;
	height: 154rpx;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #b90105;
  overflow:hidden;
  display: block;
}
.userinfo-nickname {
  font-family: PingFang SC Medium, sans-serif;
  margin: 20rpx 0;
  font-size: 36rpx;
}

</style>
