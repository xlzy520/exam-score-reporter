<template>
  <view>
   <u-cell-item :title="title" :icon="icon" :value="currentGrade" arrow-direction="down"
                @click="showPopup" />
    <u-popup v-model="show" closeable mode="bottom">
      <view class="p-4 pb-10">
        <view class="group-title">年级</view>
        <u-radio-group v-model="localGrade" :size="40" :label-size="40" width="33%"
                       shape="circle">
          <u-radio v-for="item in gradeColumn" :key="item" :name="item">{{item}}</u-radio>
        </u-radio-group>
        <view class="group-title" v-if="!onlyGrade">学期</view>
        <u-radio-group v-if="!onlyGrade" v-model="localTerm" :size="40" :label-size="40" width="33%"
                       shape="circle">
          <u-radio v-for="item in termColumn" :key="item" :name="item">{{item}}</u-radio>
        </u-radio-group>
        <view class="">
          <u-button ripple class="btn confirm-btn" @click="submit">确认</u-button>
        </view>
      </view>

    </u-popup>
  </view>
</template>

<script>
import {
  gradeColumn, termColumn
} from '@/utils/enum'

export default {
  data() {
    return {
      show: false,
      gradeColumn,
      termColumn,
      localGrade: this.grade,
      localTerm: this.term,
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
    onlyGrade: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    currentGrade() {
      if (this.onlyGrade) {
        return this.grade
      }
      return this.grade + `(${this.term})`
    },
  },
  options: {
    styleIsolation: 'apply-shared',
  },
  mounted() {
    this.localGrade = this.grade
    this.localTerm = this.term
  },

  methods: {
    showPopup() {
      this.show = true
    },
    submit() {
      const payload = { grade: this.localGrade, term: this.localTerm }
      if (this.onlyGrade) {
        delete payload.term
      }
      this.$emit('change', payload)
      this.show = false
    },

  },
}
</script>
<style lang="scss">
.group-title{
  @apply py-4 text-xl text-blue-400;
}
</style>
