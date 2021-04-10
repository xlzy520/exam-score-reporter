<template>
  <view class="container">
    <view class="userinfo">
      <open-data type="userAvatarUrl" class="userinfo-avatar"></open-data>
    </view>
    <gradePicker title="我当前的年级" icon="location-o"
                 :grade="grade" :term="term" @change="changeGrade"></gradePicker>
   <u-cell-item is-link title="课程配置" icon="setting-o" link-type="navigateTo"
              url="/pages/subjectSetting/index"></u-cell-item>
<!--   <u-cell-item is-link title="问题反馈、需求提交" icon="notes-o" @click="feedBack"></u-cell-item>-->

   <u-cell-item is-link title="问题列表查看、问题反馈提交" icon="notes-o"
              link-type="navigateTo" url="/pages/feedback/index"></u-cell-item>
   <u-cell-item is-link title="作者微信：13588043792" icon="user-o"></u-cell-item>

    <u-modal title="标题" content="需要授权用户信息" v-model="show" show-cancel-button>
      <template slot="confirm-button">
        <u-button open-type="getUserInfo" @click="getUserInfo">确定</u-button>
      </template>
    </u-modal>

  </view>
</template>

<script>
import gradePicker from 'components/gradePicker/index.vue'
import feedback from 'components/feedback/index'

const api = require('utils/api.js')

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
    gradePicker, feedback,
  },
  props: {},

  onLoad() {
  },

  onShow() {
    console.log(app.globalData)
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      const { grade, term } = userInfo
      this.grade = grade
      this.term = term
    }
  },

  methods: {
    onClose() {
      this.show = false
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
        })
      }
    },

    changeGrade(evt) {
      const [grade, term] = evt.detail
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

    feedBack() {
      console.log(222)
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
    background-color: #f8f8f8;
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
