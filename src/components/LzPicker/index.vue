<template>
  <view>
    <u-cell-item :title="title" :icon="icon" :value="value"
              arrow-direction="down" @click="showPopup"></u-cell-item>
    <u-select v-model="show" :list="columns" @confirm="onConfirm"></u-select>
  </view>
</template>

<script>
export default {
  data() {
    return {
      show: false,
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
    onConfirm(data) {
      this.$emit('change', data[0])
      this.show = false
    },

  },
}
</script>
