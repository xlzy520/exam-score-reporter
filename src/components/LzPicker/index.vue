<template>
  <view>
    <u-cell-item :title="title" :icon="icon" :value="value"
              arrow-direction="down" @click="showPopup"></u-cell-item>
    <u-select v-model="show" :default-value="[index]" :list="columns"
              @confirm="onConfirm"></u-select>
  </view>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      value: '',
    }
  },

  components: {},
  props: {
    columns: {
      type: Array,
      default: () => ([]),
    },
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    // value: {
    //   type: String,
    //   default: '',
    // },
    index: {
      type: Number,
      default: 0,
    },
  },
  options: {
    styleIsolation: 'apply-shared',
  },
  computed: {
    // value() {
    //   if (this.columns.length && this.index > -1) {
    //     return
    //   }
    //   return ''
    // }
  },
  watch: {
    index(newValue) {
      this.updateShowValue()
    },
    columns(newValue) {
      this.updateShowValue()
    },
  },
  methods: {
    showPopup() {
      this.show = true
    },
    onConfirm(data) {
      this.$emit('change', data[0])
      this.show = false
    },
    updateShowValue() {
      if (this.columns.length) {
        this.value = this.columns[this.index].label
      }
    },

  },
}
</script>
