<template>
  <view>
    <view class="fixed report-btn">
      <u-button class="padding-btn" @click="showPopup" type="primary">提交问题</u-button>
    </view>
    <u-popup v-model="show" mode="bottom">
      <view>
        <u-field label="内容：" class="feedback" v-model="content" type="textarea"
                 :autosize="{ minHeight: 150 }"
                 focus placeholder="请输入问题反馈或需求提交" />
        <view class="layout-items-center issue-type">
          <view class="issue-type-title">问题类型： </view>
          <u-radio-group v-model="issueType" class="layout-around issue-type-radios">
            <u-radio name="bug">BUG</u-radio>
            <u-radio name="req">需求</u-radio>
          </u-radio-group>
        </view>
        <u-button class="padding-btn" @click="submit" type="primary">
          提交
        </u-button>
      </view>
    </u-popup>

  </view>
</template>

<script>
import { wxCloudCallFunction } from '@/utils/request'

export default {
  data() {
    return {
      show: false,
      content: ' ',
      issueType: 'bug',
    }
  },

  components: {},
  props: {
    columns: {
      type: Array,
      default: () => ([]),
    },
    value: {
      type: String,
      default: '',
    },
  },
  options: {
    styleIsolation: 'apply-shared',
  },

  methods: {
    showPopup() {
      this.show = true
      setTimeout(() => {
        this.content = ''
      }, 300)
    },
    submit() {
      if (!this.content) {
        uni.showToast({ title: '内容不能为空' })
        return
      }
      uni.showLoading({
        title: '提交中...',
      })
      const systemInfo = wx.getSystemInfoSync()
      wxCloudCallFunction('add', {
        collectionName: 'report',
        content: this.content,
        issueType: this.issueType,
        systemInfo,
      }).then(res => {
        uni.showToast({ title: '提交成功' })
        uni.requestSubscribeMessage({
          tmplIds: ['uuVKAXzVmts-7XV3Zpxej6KSI4Dpz9_798toTNCqk7U'],

        })
        this.show = false
        this.$emit('change')
      }).finally(() => {
        uni.hideLoading()
      })
    },

  },
}
</script>
<style lang="scss">
  .feedback{
    min-height: 200upx;
  }
  .issue-type{
    padding: 0 30upx;
    &-title{
      font-size: 36upx;
      line-height: 50upx;
      color: #333;
      margin-right: 30upx;
    }
  }
  .issue-type-radios{
    height: 120upx;
    flex-grow: 1;
  }
</style>
