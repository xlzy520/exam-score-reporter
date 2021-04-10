<template>
  <view class="container feedback">
   <u-cell-item v-for="report in reports"
              :key="report._id"
              class="feedback-item"
              :label="getDate(report.createdTime)">
      <view slot="title" class="cell-header">
        <u-tag type="danger" class="report-cell-tag">{{getIssueType(report.issueType)}}</u-tag>
        <view class="u-cell-text"
              :class="report.type==='resolve'?'resolve': ''">{{report.content}}</view>
      </view>
    </u-cell-item>
    <feedback @change="getFeedBackList" />
    <view class="bottom"></view>

    <!--    <u-popup :show="show" position="bottom" @close="onClose">-->
    <!--      <u-picker :columns="columns" show-toolbar @cancel="onClose"-->
    <!--                  @confirm="onConfirm"></u-picker>-->
    <!--    </u-popup>-->
  </view>
</template>

<script>
import feedback from 'components/feedback/index'
import dayjs from 'dayjs'
import {issueTypeEnum} from "../../utils/enum";

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
    getIssueType (val = 'bug'){
      return issueTypeEnum[val]
    },
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
  .feedback{
    padding-bottom: 60upx;
    .feedback-item:last-child{
      margin-bottom: 60upx;
    }
    .bottom{
      margin-bottom: 120upx;
      line-height: 1px;
      height: 1px;
    }
  }
  .feedback-item{

  }
  .resolve{
    text-decoration: line-through;
  }
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
    .u-cell-text{
      display: flex;
      flex-wrap: wrap;
      margin-left: 30upx;
    }
  }
</style>
