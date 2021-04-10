<template>
  <view>
    <u-cell-item :title="title" is-link :icon="icon" :value="value"
              arrow-direction="down" @click="showPopup"></u-cell-item>
    <u-popup :show="show" position="bottom" @close="onClose">
      <u-picker :columns="columns" show-toolbar @cancel="onClose" @confirm="onConfirm" />
    </u-popup>
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

    onClose() {
      this.show = false
    },

    onConfirm(event) {
      this.$emit('change', event.detail)
      this.onClose()
    },

  },
}
</script>
