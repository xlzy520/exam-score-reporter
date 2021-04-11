<template>
  <view class="container">
    <view class="userinfo">
      <open-data type="userAvatarUrl" class="userinfo-avatar"></open-data>
    </view>
    <gradePicker title="我当前的年级" icon="map"
                 :grade="grade" :term="term" @change="changeGrade"></gradePicker>
   <u-cell-item title="课程配置" icon="setting"
                @click="navTo('/pages/subjectSetting/index')"></u-cell-item>
   <u-cell-item title="问题列表查看、问题反馈提交" icon="order"
                @click="navTo('/pages/feedback/index')"></u-cell-item>
   <u-cell-item :arrow="false" title="作者微信：13588043792(点击复制)" icon="account"
                @click="copyWx"></u-cell-item>

    <u-modal title="提示" content="需要授权用户信息,用于存储数据" v-model="show">
      <template class="px-2" slot="confirm-button">
        <u-button type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">确定</u-button>
      </template>
    </u-modal>

  </view>
</template>

<script>
import gradePicker from 'components/gradePicker/index.vue'
import { wxCloudCallFunction } from '@/utils/request'

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

  onLoad() {
  },

  onShow() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      const { grade, term } = userInfo
      this.grade = grade
      this.term = term
    }
  },

  methods: {
    copyWx() {
      uni.setClipboardData({
        data: '13588043792', // 要复制的文字
        success() {
          uni.getClipboardData({
            success() {
              uni.showToast({
                title: '复制微信成功',
              })
            },
          })
        },
      })
    },
    navTo(url) {
      uni.navigateTo({ url })
    },
    onClose() {
      this.show = false
    },

    getUserInfo(event) {
      this.show = false
      if (!app.globalData.userInfo) {
        const detail = event.detail
        detail.userInfo.grade = this.grade
        detail.userInfo.term = this.term
        wxCloudCallFunction('addUser', {
          collectionName: 'users',
          ...detail,
        }).then(res => {
          app.globalData.userInfo = detail.userInfo
          this.saveCurrentGrade()
        })
      }
    },

    changeGrade(data) {
      const { grade, term } = data
      this.grade = grade
      this.term = term
      if (!app.globalData.userInfo) {
        this.show = true
      } else {
        this.saveCurrentGrade()
      }
    },

    saveCurrentGrade() {
      const {
        grade,
        term,
      } = this
      wxCloudCallFunction('update', {
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
  },
}
</script>
<style lang="scss">
  .container {
    min-height: 100vh;
    overflow: hidden;
    background-image: url("https://cdn.it120.cc/apifactory/2019/03/07/1c731c0a355da6c7f0e163fa1917d4d3.png");
    background-position: 0 -128rpx;
    background-size: 750upx auto, 1500upx, auto;
    background-repeat: no-repeat;
    //background-color: #f8f8f8;
    color: #000;

    .userinfo {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 750upx;
      margin-top: 120upx;
    }

    .userinfo-avatar {
      width: 154upx;
      height: 154upx;
      border-radius: 50%;
      border: 2px solid #fff;
      background-color: #b90105;
      overflow: hidden;
      display: block;
    }

    .userinfo-nickname {
      font-family: PingFang SC Medium, sans-serif;
      margin: 20upx 0;
      font-size: 36upx;
    }
  }

</style>
