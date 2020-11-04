<template>
  <view>
    <van-cell :title="title" is-link :icon="icon" :value="currentGrade"
              arrow-direction="down" @click="showPopup"></van-cell>
    <van-popup :show="show" position="bottom" @close="onClose">
      <van-picker :columns="columns" show-toolbar @cancel="onClose" @confirm="onConfirm" />
    </van-popup>
  </view>
</template>

<script>
import { gradeAndTermColumn } from '../../utils/enum'

const app = getApp()

export default {
  data() {
    return {
      show: false,
      columns: gradeAndTermColumn,
    }
  },

  components: {},
  props: {
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    grade: {
      type: String,
      default: '初三',
    },
    term: {
      type: String,
      default: '上学期',
    },
  },
  computed: {
    currentGrade() {
      return this.grade + `(${this.term})`
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

    onConfirm(event) {
      const {
        value,
      } = event.detail
      this.$emit('change', { detail: value })
      this.onClose()
    },

  },
}
</script>
