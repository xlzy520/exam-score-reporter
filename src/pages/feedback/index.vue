<template>
  <view class="container feedback">
    <u-cell-item v-for="report in reports" :key="report._id" class="feedback-item" :arrow="false"
                 :label="getDate(report.createdTime)" @click="reply(report)">
      <view slot="title" class="cell-header">
        <u-tag :type="getTagType(report)" class="report-cell-tag"
               :text="getIssueType(report.issueType)"/>
        <view :class="{'u-cell-text': true, resolve: report.type==='resolve'}">
          {{ report.content }}
        </view>
        <view class="" v-if="report.reply">
          <view class="text-red-500 mt-6 reply-text" v-for="item in report.reply" :key="item">
            {{ item.content }}  ---回复时间： {{getDate(item.date)}}
          </view>
        </view>
      </view>
    </u-cell-item>
    <feedback @change="getFeedBackList"/>
    <u-popup v-model="replyVisible" mode="center">
      <view>
        <u-field label="回复：" class="reply-popup" v-model="content" type="textarea"
                 :autosize="{ minHeight: 150 }" focus confirmType="asd"/>
        <view class="layout-items-center issue-type">
          <view class="issue-type-title">是否解决：</view>
          <u-radio-group v-model="type" class="layout-around issue-type-radios">
            <u-radio name="resolve">是</u-radio>
            <u-radio name="pending">否</u-radio>
          </u-radio-group>
        </view>
        <u-button class="padding-btn" @click="submit" type="primary">
          提交
        </u-button>
      </view>
    </u-popup>
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
      replyVisible: false,
      content: '',
      type: 'pending',
      curFeedback: {},
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
    reply(item) {
      this.replyVisible = true
      this.curFeedback = item
    },
    submit() {
      const payload = {
        collectionName: 'report',
        _id: this.curFeedback._id,
        type: this.type,
      }
      const originReply = this.curFeedback.reply
      const reply = { content: this.content, date: Date.now() }
      if (originReply) {
        payload.reply = [...originReply, reply]
      } else {
        payload.reply = [reply]
      }
      wxCloudCallFunction('update', payload).then(res => {
        uni.showToast({ title: '提交成功' })
        this.replyVisible = false
        this.getFeedBackList()
        this.Booking()
      }).finally(() => {
        uni.hideLoading()
      })
    },
    Booking() {
      wx.cloud.callFunction({
        name: 'sendMsg',
        data: {
          templateId: 'wSITY4Il1rPT__ot_Gz5v3ORl3RtZz9S8Ai67YnkCpY',
          character: '123456',
          name: '瑶瑶',
        },
        success: res => {
          console.log('[云函数] : ', res.result)
        },
        fail: err => {
          console.error('[云函数]  调用失败', err)
        },
      })
    },
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
  },
}
</script>
<style lang="scss">
.reply-popup {
  min-height: 200upx;
  width: 80%;
}

.issue-type {
  padding: 0 30upx;

  &-title {
    font-size: 36upx;
    line-height: 50upx;
    color: #333;
    margin-right: 30upx;
  }
}

.issue-type-radios {
  height: 120upx;
  flex-grow: 1;
}

.feedback {
  padding-bottom: 60upx;

  .feedback-item:last-child {
    margin-bottom: 60upx;
  }

  .bottom {
    margin-bottom: 120upx;
    line-height: 1px;
    height: 1px;
  }
}

.feedback-item {

}

.resolve {
  text-decoration: line-through;
}

.report-btn {
  bottom: 60upx;
  left: 30%;
  right: 30%;
  margin: auto;
  z-index: 9999;
}

.cell-header {
  display: flex;
  justify-content: flex-start;

  .report-cell-tag {
    min-width: 90upx;
  }

  .u-cell-text {
    display: flex;
    flex-wrap: wrap;
    margin-left: 30upx;
  }
}
.reply-text{
  margin-left: -50upx;
}
</style>
