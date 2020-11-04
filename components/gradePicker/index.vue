<template>
  <view>
    <van-cell :title="title" is-link :icon="icon" :value="currentGrade"
              arrow-direction="down" @click="showPopup"></van-cell>
    <van-popup :show="show" position="bottom" @close="onClose">
      <van-picker :columns="columns" show-toolbar @cancel="onClose" @confirm="onConfirm"></van-picker>
    </van-popup>
  </view>
</template>

<script>
  import {gradeAndTermColumn} from '../../utils/enum';

  const app = getApp();

  export default {
    data() {
      return {
        show: false,
        columns: gradeAndTermColumn,
        // currentGrade: '初三(上学期)'
      };
    },

    components: {},
    props: {
      icon: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      grade: {
        type: String,
        default: '初三'
      },
      term: {
        type: String,
        default: '上学期'
      }
    },
    computed:{
      currentGrade(){
        return this.grade + `(${this.term})`;
      }
    },
    // watch: {
    //   'grade, term': function (numberA, numberB) {
    //     // 在 numberA 或者 numberB 被设置时，执行这个函数
    //     this.setCurrentGrade();
    //   }
    // },
    options: {
      styleIsolation: 'apply-shared'
    },

    beforeMount() {
      // this.setCurrentGrade();
    },


    methods: {
      showPopup() {
        this.show = true
      },

      onClose() {
        this.show = false
      },

      setCurrentGrade() {
        this.currentGrade = this.grade + `(${this.term})`
      },

      onConfirm(event) {
        const {
          value
        } = event.detail;
        this.$emit('change', {
          detail: value
        });
        // this.setCurrentGrade();
        this.onClose();
      }

    }
  };
</script>
