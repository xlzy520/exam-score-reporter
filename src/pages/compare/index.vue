<template>
<view class="container">
  <gradePicker title="年级" :grade="gradeData.grade" :term="gradeData.term" only-grade
               @change="changeGrade"></gradePicker>
  <LzPicker title="考试1" :value="examName1" :columns="columns" @change="changeExam1"/>
  <LzPicker title="考试2" :value="examName2" :columns="columns" @change="changeExam2"/>
  <view class="qiun-columns" v-if="canCompare">
    <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
      <view class="qiun-title-dot-light">成绩对比图</view>
    </view>
    <view class="charts-box">
      <qiun-data-charts type="column" :chartData="chartData" :opts="columnOpts" />
    </view>

    <view class="charts-box">
      <qiun-data-charts type="line" :chartData="chartData" />
    </view>
  </view>
  <u-empty v-if="!canCompare" text="暂无足够的数据进行对比"></u-empty>
  <view class="tips">
    如有新需求，请去我的页面提交
  </view>

</view>
</template>

<script>
import { wxCloudCallFunction } from '@/utils/request'
import LzPicker from 'components/LzPicker/index.vue'

export default {
  data() {
    return {
      examName1: '',
      examName2: '',
      columns: [],
      examDataList: [],
      chartData: {},
      columnOpts: {},
      gradeData: {
        grade: '初三',
        term: '上学期',
      },
    }
  },

  components: {
    LzPicker,
  },
  computed: {
    canCompare() {
      return this.examDataList.length > 1
    },
  },
  props: {},

  onLoad() {
    this.getExamsList()
  },

  methods: {
    changeGrade(data) {
      this.gradeData = data
      this.getExamsList()
    },
    changeExam1(item) {
      this.examName1 = item.value
      this.showBaseLine()
    },
    changeExam2(item) {
      this.examName2 = item.value
      this.showBaseLine()
    },
    showBaseLine() {
      const chartData = {}
      const average1 = this.examDataList[0].average
      const average2 = this.examDataList[1].average
      chartData.categories = this.examDataList[0].subjects.map(v => v.name)
      chartData.series = [this.examName1, this.examName2].map((v, index) => ({
        name: v,
        data: this.examDataList[index].subjects.map(v => (Number(v.value))),
      }))
      this.chartData = chartData
      this.columnOpts = {
        type: 'column',
        padding: [15, 15, 0, 15],
        fontSize: 11,
        legend: {
          show: true,
          padding: 5,
          lineHeight: 11,
          margin: 0,
        },
        background: '#FFFFFF',
        pixelRatio: 1,
        enableMarkLine: true,
        dataLabel: true,
        categories: chartData.categories,
        series: chartData.series,
        animation: true,
        xAxis: {
          disableGrid: true,
        },
        extra: {
          type: 'group',
          meter: {
            // 这个是外层边框的宽度
            border: 4,
            // 这个是内部填充颜色
            fillColor: '#E5FDC3',
          },
          markLine: {
            type: 'dash',
            dashLength: 5,
            data: [{
              value: average1,
              lineColor: '#f04864',
              showLabel: true,
            }, {
              value: average2,
              lineColor: '#f04864',
              showLabel: true,
            }],
          },

        },
      }
    },
    getExamsList() {
      uni.showLoading({
        title: '加载中...',
      })
      wxCloudCallFunction('findAll', {
        collectionName: 'scores',
        ...this.gradeData,
      }).then(res => {
        if (res.data.length > 1) {
          this.examDataList = res.data
          this.columns = res.data.map(v => ({ label: v.examName, value: v.examName }))
          this.examName1 = res.data[0].examName
          this.examName2 = res.data[1].examName
          this.showBaseLine()
        } else {
          this.$showToast('考试次数不足两次，无法对比')
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },
  },
}
</script>
<style lang="scss">
  .qiun-charts-rotate {
    width: 700upx;
    height: 1100upx;
    background-color: #FFFFFF;
    padding: 25upx;
  }

  .charts-rotate {
    width: 700upx;
    height: 1100upx;
    background-color: #FFFFFF;
  }
  .tips{
    padding: 60upx;
    background: #fff;
    margin-top: 60upx;
    white-space: 90%;
    margin: auto;
    font-size: 32upx;
    color: #ccc;
  }
/**index.wxss**/

</style>
