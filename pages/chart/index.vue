<template>
  <view class="container">
    <!--  <van-empty image="/static/images/zaizuole.jpg" description="在做了，在做了"></van-empty>-->
    <!--  <view>-->
    <!--    可以通过可视化图表展示某一科目的多次考试成绩的曲线，也可以展示多次考试整体成绩的曲线。-->
    <!--  </view>-->
    <!--  <view class="title">例图</view>-->
    <!--  <image src="/static/images/example-chart.png"></image>-->
    <LzPicker title="考试名" :value="currentExamData.examName"
              :columns="columns" @change="changeExam"/>
    <view class="qiun-columns">
      <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
        <view class="qiun-title-dot-light">本次考试各科目成绩占比</view>
      </view>
      <view class="qiun-charts">
        <canvas canvas-id="canvasPie" id="canvasPie" class="charts" @touchstart="touchPie"></canvas>
      </view>
      <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
        <view class="qiun-title-dot-light">柱形图</view>
      </view>
      <view class="qiun-charts">
        <canvas canvas-id="canvasBaseLine" id="canvasBaseLine" class="charts"
                @touchstart="touchBaseLine"></canvas>
      </view>
    </view>
    <gradeMenu class="exam-menu" :grade="gradeData.grade" :term="gradeData.term"
               @change="changeGradeMenu"/>
    <view class="qiun-columns">
      <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
        <view class="qiun-title-dot-light">该学期各科目成绩</view>
      </view>
      <view class="qiun-charts">
        <canvas canvas-id="singleSubject" id="singleSubject" class="charts"
                @touchstart="touchSubjectLine"></canvas>
      </view>
    </view>
    <!--  <view class="title">联系作者</view>-->
    <!--  <image src="/static/images/qrcode.png"></image>-->
  </view>
</template>

<script>
import uCharts from 'components/u-charts/u-charts.js'
import LzPicker from 'components/LzPicker/index.vue'
import gradeMenu from 'components/gradeMenu/index.vue'
import api from 'utils/api.js'

let _self
let canvasPie = null
let canvasSubejctLine = null
let canvasBaseLine = null
export default {
  data() {
    return {
      cWidth: '',
      cHeight: '',
      pixelRatio: 1,
      columns: [],
      examDataList: [],
      examSelectedIndex: 0,
      currentExamData: {},
      // examMenu: [],
      // subjectMenu: [],
      // examMenuSelectedIndex: '0',
      // subjectMenuSelectedIndex: 0,
      // currentExamMenuData: {},
      chartData: {
        categories: [],
        series: [],
      },
      gradeData: {
        grade: '初三',
        term: '上学期',
      },
      gradeAndTermExamList: [],
    }
  },

  components: {
    LzPicker, gradeMenu,
  },
  props: {},

  onLoad() {
    _self = this
    this.cWidth = uni.upx2px(750)
    this.cHeight = uni.upx2px(500)
    this.getExamsList()
  },

  methods: {
    showPie(canvasId, chartData) {
      canvasPie = new uCharts({
        $this: _self,
        canvasId,
        type: 'pie',
        fontSize: 11,
        background: '#FFFFFF',
        legend: {
          show: true,
          position: 'right',
          float: 'center',
          itemGap: 10,
          padding: 5,
          lineHeight: 26,
          margin: 5,
          borderWidth: 1,
        },
        pixelRatio: _self.pixelRatio,
        series: chartData.series,
        animation: true,
        width: _self.cWidth * _self.pixelRatio,
        height: _self.cHeight * _self.pixelRatio,
        dataLabel: true,
        extra: {
          pie: {
            lableWidth: 15,
          },
        },
      })
    },
    showBaseLine() {
      const scores = []; const
        fulls = []
      const chartData = {}
      let total = 0
      chartData.categories = this.currentExamData.subjects.map(v => {
        scores.push(v.value)
        fulls.push(v.full)
        total += Number(v.value)
        return v.name
      })
      const average = (total / scores.length).toFixed(2)
      chartData.series = [
        { name: '满分', data: fulls, color: '#1890ff' },
        { name: '得分', data: scores, color: '#2fc25b' }
      ]
      canvasBaseLine = new uCharts({
        $this: _self,
        canvasId: 'canvasBaseLine',
        type: 'column',
        fontSize: 11,
        legend: {
          show: true,
          padding: 5,
          lineHeight: 11,
          margin: 0,
        },
        dataLabel: false,
        dataPointShape: true,
        background: '#FFFFFF',
        pixelRatio: 1,
        enableMarkLine: true,

        categories: chartData.categories,
        series: chartData.series,
        animation: true,
        rotate: false,
        xAxis: {
          disableGrid: true,
        },
        yAxis: {
          splitNumber: 5,
          min: 0,
          max: 150,
        },
        width: this.cWidth,
        height: this.cHeight,
        extra: {
          column: {
            type: 'meter',
            width: _self.cWidth * _self.pixelRatio * 0.45 / chartData.categories.length,
            meter: {
              // 这个是外层边框的宽度
              border: 4,
              // 这个是内部填充颜色
              fillColor: '#E5FDC3',
            },
          },
          markLine: {
            type: 'dash',
            dashLength: 5,
            data: [{
              value: average,
              lineColor: '#f04864',
              showLabel: true,
            }],
          },

        },
      })
    },
    touchPie(e) {
      canvasPie.showToolTip(e, {
        format(item) {
          return item.name
        },
      })
      canvasPie.touchLegend(e, { animation: true })
    },
    touchSubjectLine(e) {
      canvasSubejctLine.showToolTip(e, {
        format(item) {
          return item.name
        },
      })
      canvasSubejctLine.touchLegend(e, { animation: true })
    },
    touchBaseLine(e) {
      canvasBaseLine.showToolTip(e, {
        format(item) {
          return item.name
        },
      })
      canvasBaseLine.touchLegend(e, { animation: true })
    },
    showSubjectsLine() {
      const chartData = this.chartData
      canvasSubejctLine = new uCharts({
        $this: _self,
        canvasId: 'singleSubject',
        type: 'line',
        fontSize: 11,
        legend: {
          show: true,
          padding: 35,
          lineHeight: 21,
          margin: 0,
        },
        dataLabel: false,
        dataPointShape: true,
        background: '#FFFFFF',
        pixelRatio: 1,
        categories: chartData.categories,
        series: chartData.series,
        animation: true,
        xAxis: {
          disableGrid: true,

        },
        yAxis: {
          // gridType: 'dash',
          // gridColor: '#CCCCCC',
          // dashLength: 8,
          splitNumber: 5,
          min: 0,
          max: 150,
          // format: (val) => val.toFixed(0) + '元',
        },
        width: this.cWidth,
        height: this.cHeight,
        extra: {
          line: {
            type: 'straight',
          },
        },
      })
    },

    changePieData() {
      const Pie = { series: [] }
      const Column = { series: [], categories: [] }
      Pie.series = this.currentExamData.subjects.map(s => ({ name: s.name + ':' + s.value, data: Number(s.value) }))

      this.showPie('canvasPie', Pie)
      console.log(Column)
      const ss = {
        categories: ['2012', '2013', '2014', '2015', '2016', '2017'],
        series: [{
          name: '成交量1',
          data: [15, { value: 20, color: '#f04864' }, 45, 37, 43, 34],
        }, {
          name: '成交量2',
          data: [30, { value: 40, color: '#facc14' }, 25, 14, 34, 18],
        }],
      }
      this.showBaseLine('canvasBaseLine', Column)
    },
    changeGradeAndTermExamList() {
      this.gradeAndTermExamList = this.examDataList.filter(
        f => f.grade === this.gradeData.grade && f.term === this.gradeData.term
      )
    },

    getExamsList() {
      uni.showLoading({
        title: '加载中...',
      })
      api.wxCloudCallFunction('findAll', {
        collectionName: 'scores',
      }).then(res => {
        this.examDataList = res.data
        this.columns = res.data.map(v => v.examName)
        this.changeGradeAndTermExamList()
        if (res.data.length) {
          this.currentExamData = this.examDataList[0]
          this.changePieData()
          this.changeGradeMenu()
        }
        console.log(res.data)
      }).finally(() => {
        uni.hideLoading()
      })
    },
    changeExam({ value, index }) {
      this.examSelectedIndex = index
      this.currentExamData = this.examDataList[index]
      this.changePieData()
    },
    changeGradeMenu(data = this.gradeData) {
      this.gradeData = data
      this.changeGradeAndTermExamList()
      this.chartData.categories = this.gradeAndTermExamList[0].subjects.map(v => v.name)
      this.chartData.series = this.gradeAndTermExamList.map(v => ({
        name: v.examName,
        data: v.subjects.map(s => s.value),
      }))
      _self.showSubjectsLine()
    },
  },
}
</script>
<style lang="scss">
  .exam-menu{
    margin-top: 10upx;
  }
  page{background:#F2F2F2;width: 750upx;overflow-x: hidden;}
  .qiun-padding{padding:2%; width:96%;}
  .qiun-wrap{display:flex; flex-wrap:wrap;}
  .qiun-rows{display:flex; flex-direction:row !important;}
  .qiun-columns{display:flex; flex-direction:column !important;}
  .qiun-common-mt{margin-top:10upx;}
  .qiun-bg-white{background:#FFFFFF;}
  .qiun-title-bar{width:96%; padding:10upx 2%; flex-wrap:nowrap;}
  .qiun-title-dot-light{
    border-left: 10upx solid #0ea391;
    padding-left: 10upx;
    font-size: 32upx;
    color: #000000
  }
  .qiun-charts{width: 750upx; height:500upx;background-color: #FFFFFF;}
  .charts{width: 750upx; height:500upx;background-color: #FFFFFF;}
  /**index.wxss**/
  .title{
    text-align: center;
    font-size: 40rpx;
    font-weight: bold;
    padding: 30rpx 0;
    color: #FF6699;
  }

  image{
    width: 690rpx;
    box-sizing: border-box;
    margin: auto;
  }

</style>
