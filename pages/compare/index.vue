<template>
<view class="container">
  <LzPicker title="考试1" :value="examDataList[examIndex1].examName" :columns="columns"
            @change="evt=>changeExam(evt, 1)"/>
  <LzPicker title="考试2" :value="examDataList[examIndex2].examName" :columns="columns"
            @change="evt=>changeExam(evt, 2)"/>
  <view class="qiun-columns" v-if="canCompare">
    <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
      <view class="qiun-title-dot-light">成绩对比图</view>
    </view>
    <view class="qiun-charts-rotate">
      <canvas canvas-id="canvasBaseLine" id="canvasBaseLine" class="charts-rotate"
              @touchstart="touchBaseLine"></canvas>
    </view>
  </view>
  <van-empty v-if="!canCompare" description="暂无足够的数据进行对比"></van-empty>
  <view class="tips">
    可以选择相同考试科目的两次考试成绩进行各项数据的比较。如有新需求，请去我的页面提交
  </view>
  <van-toast id="van-toast" />

</view>
</template>

<script>
import uCharts from 'components/u-charts/u-charts.js'
import api from 'utils/api.js'
import Toast from 'wxcomponents/vant/toast/toast'
import LzPicker from 'components/LzPicker/index.vue'

let _self
let canvasBaseLine = null

export default {
  data() {
    return {
      cWidth: '',
      cHeight: '',
      pixelRatio: 1,
      examIndex1: 0,
      examIndex2: 0,
      columns: [],
      examDataList: [],
      compareData: [],
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
    _self = this
    // #ifdef MP-ALIPAY
    uni.getSystemInfo({
      success(res) {
        if (res.pixelRatio > 1) {
          // 正常这里给2就行，如果pixelRatio=3性能会降低一点
          // _self.pixelRatio =res.pixelRatio;
          _self.pixelRatio = 2
        }
      },
    })
    // #endif
    this.cWidth = uni.upx2px(700)
    this.cHeight = uni.upx2px(1100)
    this.getExamsList()
  },

  methods: {
    showBaseLine() {
      const chartData = {}
      const average1 = this.examDataList[0].average
      const average2 = this.examDataList[1].average
      chartData.categories = this.examDataList[0].subjects.map(v => v.name)
      chartData.series = [this.examIndex1, this.examIndex2].map(v => ({
        name: this.examDataList[v].examName,
        data: this.examDataList[v].subjects.map(v => (Number(v.value))),
      }))
      console.log(chartData)

      canvasBaseLine = new uCharts({
        $this: _self,
        canvasId: 'canvasBaseLine',
        type: 'column',
        padding: [15, 15, 0, 15],
        fontSize: 11,
        legend: {
          show: true,
          padding: 5,
          lineHeight: 11,
          margin: 0,
        },
        rotate: true,
        // dataPointShape: true,
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
        yAxis: {
        },
        width: _self.cWidth * _self.pixelRatio,
        height: _self.cHeight * _self.pixelRatio,
        extra: {
          type: 'group',
          width: _self.cWidth * _self.pixelRatio * 0.45 / chartData.categories.length,
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
      })
    },
    touchBaseLine(e) {
      canvasBaseLine.showToolTip(e, {
        format(item, category) {
          return category + ' ' + item.name + ':' + item.data
        },
      })
      canvasBaseLine.touchLegend(e, { animation: true })
    },
    getExamsList() {
      uni.showLoading({
        title: '加载中...',
      })
      api.wxCloudCallFunction('findAll', {
        collectionName: 'scores',
      }).then(res => {
        if (res.data.length > 1) {
          this.examDataList = res.data
          this.columns = res.data.map(v => v.examName)
          this.examIndex2 = 1
          this.showBaseLine()
        } else {
          Toast('考试次数不足两次，无法对比')
          return
        }
        console.log(res.data)
      }).finally(() => {
        uni.hideLoading()
      })
    },
    changeExam({ value, index }, examIndex) {
      this['examIndex' + examIndex] = index
      this.showBaseLine()
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
