<template>
  <view class="container">
    <van-cell v-for="report in reports"
              :key="report._id"
              :label="getDate(report.createdTime)">
      <view slot="title" class="cell-header">
        <van-tag type="danger" class="report-cell-tag">标签</van-tag>
        <view class="van-cell-text">{{report.content}}</view>
      </view>
    </van-cell>
    <feedback />

    <!--    <van-popup :show="show" position="bottom" @close="onClose">-->
    <!--      <van-picker :columns="columns" show-toolbar @cancel="onClose"-->
    <!--                  @confirm="onConfirm"></van-picker>-->
    <!--    </van-popup>-->
  </view>
</template>

<script>
import feedback from 'components/feedback/index'
import dayjs from 'dayjs'

const api = require('utils/api.js')

const app = getApp()

export default {
  data() {
    return {
      reports: [],
      show: false,
    }
  },
  components: {
    feedback,
  },
  props: {},

  onLoad() {
    this.getFeedBackList()
  },

  onShow() {

  },

  methods: {
    getDate(unix) {
      return dayjs(unix).format('YYYY年MM月DD日')
    },
    getFeedBackList() {
      api.wxCloudCallFunction('findAllFeedback', {}).then(({ data }) => {
        if (data && data.length) {
          this.reports = data
          console.log(data)
        }
        console.log(data)
      })
    },
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
  .report-btn {
    bottom: 60rpx;
    left: 30%;
    right: 30%;
    margin: auto;
  }
  .cell-header{
    display: flex;
    justify-content: flex-start;
    .report-cell-tag{
      min-width: 90upx;
    }
    .van-cell-text{
      display: flex;
      flex-wrap: wrap;
      margin-left: 30upx;
    }
  }
</style>
