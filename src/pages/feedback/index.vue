<template>
  <view class="container feedback">
   <u-cell-item v-for="report in reports" :key="report._id"
              class="feedback-item" :arrow="false"
              :label="getDate(report.createdTime)">
      <view slot="title" class="cell-header">
        <u-tag :type="getTagType(report)" class="report-cell-tag"
               :text="getIssueType(report.issueType)" />
        <view :class="{'u-cell-text': true, resolve: report.type==='resolve'}">
          {{report.content}}</view>
      </view>
    </u-cell-item>
    <feedback @change="getFeedBackList" />
    <view class="bottom"></view>
  </view>
</template>

<script>
import feedback from 'components/feedback/index'
import dayjs from 'dayjs'
import { wxCloudCallFunction } from '@/utils/request'
import { issueTypeEnum } from '@/utils/enum'

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
    getIssueType(val = 'bug') {
      return issueTypeEnum[val]
    },
    getTagType(report) {
      const issueType = report.issueType || 'bug'
      return issueType === 'bug' ? 'error' : 'warning'
    },
    getDate(unix) {
      return dayjs(unix).format('YYYY年MM月DD日')
    },
    getFeedBackList() {
      wxCloudCallFunction('findAllFeedback', {}).then(({ data }) => {
        if (data && data.length) {
          this.reports = data
        }
        console.log(data)
      })
    },
    getUserInfo(event) {
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
    z-index: 9999;
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
