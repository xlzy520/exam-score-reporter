<template>
  <view>
    <van-cell is-link title="问题反馈、需求提交" icon="notes-o" @click="showPopup"></van-cell>
    <van-popup :show="show" position="bottom" @close="onClose">
      <view>
        <van-field class="feedback" :value="content" @change="changeValue"
                   type="textarea"  :autosize="{ minHeight: 50 }" auto-focus
                   placeholder="请输入问题反馈或需求提交" />
        <van-button class="padding-btn" block round @tap="submit" type="primary">
          提交
        </van-button>
      </view>
    </van-popup>
    <van-toast id="van-toast" />

  </view>
</template>

<script>
import api from 'utils/api.js'
import Toast from 'wxcomponents/vant/toast/toast'

export default {
  data() {
    return {
      show: false,
      content: '',

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
    },

    onClose() {
      this.show = false
    },

    changeValue(evt) {
      this.content = evt.detail
    },
    submit() {
      if (!this.content) {
        Toast('内容不能为空')
        return
      }
      uni.showLoading({
        title: '提交中...',
      })
      api.wxCloudCallFunction('add', {
        collectionName: 'report',
        content: this.content,
      }).then(res => {
        Toast('添加成功')
        console.log(res)
        // this.$emit('change', event.detail)
        this.onClose()
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
</style>
