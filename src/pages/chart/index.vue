<template>
  <view class="container">
    <gradePicker title="年级" :grade="gradeData.grade" :term="gradeData.term"
                 @change="changeGrade"></gradePicker>
    <LzPicker title="考试名" :index="curExamIndex" :columns="columns" @change="changeExam"/>

    <view class="qiun-columns">
      <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
        <view class="qiun-title-dot-light">本次考试各科目成绩雷达图</view>
      </view>
      <view class="charts-box">
        <qiun-data-charts type="radar" :chartData="curExamChartData" :opts="radarOpts" />
      </view>
    </view>

    <view class="qiun-columns">
      <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
        <view class="qiun-title-dot-light">本次考试各科目成绩占比</view>
      </view>
      <view class="charts-box">
        <qiun-data-charts
            type="pie"
            :chartData="curExamPieData"
            background="none"
            :animation="false"
        />
      </view>
      <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
        <view class="qiun-title-dot-light">柱形图</view>
      </view>
      <view class="charts-box">
        <qiun-data-charts
            type="column"
            :chartData="curExamChartData"
            :opts="columnOpts"
            background="none"
            :animation="false"
        />
      </view>
    </view>
    <view class="qiun-columns">
      <view class="qiun-bg-white qiun-title-bar qiun-common-mt">
        <view class="qiun-title-dot-light">该学期各科目成绩</view>
      </view>
      <view class="charts-box">
        <qiun-data-charts type="line" :opts="lineOpts" :chartData="chartData"/>
      </view>
    </view>
    <ad unit-id="adunit-bd3191b355d39c3e" ad-type="video" ad-theme="white"></ad>
  </view>
</template>

<script>
import LzPicker from 'components/LzPicker/index.vue'
import { wxCloudCallFunction } from '@/utils/request'

const app = getApp()

export default {
  data() {
    return {
      columns: [],
      examDataList: [],
      currentExamData: {},
      curExamIndex: 0,
      chartData: {
        categories: [],
        series: [],
      },
      gradeData: {
        grade: '初三',
        term: '上学期',
      },
      gradeAndTermExamList: [],
      curExamChartData: {
        categories: [],
        series: [],
      },
      curExamPieData: {
        // categories: [],
        series: [],
      },
      radarOpts: {
        color: [
          '#b5eed3',
          '#1890FF'
        ],
        extra: {
          radar: {
            max: 150,
            opacity: 0.8,
            gridType: 'circle',
          },
        },
      },
      columnOpts: {
        xAxis: {
          disableGrid: true,
        },
        yAxis: {
          // splitNumber: 10,
          min: 0,
          // max: 150,
        },
        extra: {
          line: {
            type: 'straight',
          },
        },
      },
      lineOpts: {
        xAxis: {
          disableGrid: true,
        },
        yAxis: {
          // splitNumber: 10,
          min: 0,
          // max: 150,
        },
        extra: {
          line: {
            type: 'straight',
          },
        },
      },
    }
  },

  components: {
    LzPicker,
  },
  props: {},

  onLoad() {

  },
  onShow() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      const { grade, term } = userInfo
      this.changeGrade({ grade, term })
    }
  },
  methods: {
    showBaseLine() {
      const scores = []
      const fulls = []
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
        { name: '满分', data: fulls },
        { name: '得分', data: scores }
      ]
      this.curExamChartData = chartData
      this.columnOpts = {
        extra: {
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
      }
    },
    changePieData() {
      const Pie = { series: [] }
      Pie.series = this.currentExamData.subjects.map(s => ({ name: s.name + ':' + s.value, data: Number(s.value) }))
      this.curExamPieData = Pie
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
      wxCloudCallFunction('findAll', {
        collectionName: 'scores',
        ...this.gradeData,
      }).then(res => {
        this.examDataList = res.data
        this.columns = res.data.map((v, index) => ({ label: v.examName, value: index, extra: v }))
        this.changeGradeAndTermExamList()
        if (res.data.length) {
          this.currentExamData = this.examDataList[0]
          this.changePieData()
          this.showBaseLine()
          this.changeGradeMenu()
        } else {
          this.$showToast('此条件下暂无数据，请选择其他条件')
        }
        console.log(res.data)
      }).finally(() => {
        uni.hideLoading()
      })
    },
    changeGrade(data) {
      this.gradeData = data
      this.getExamsList()
    },
    changeExam({ value, extra }) {
      this.currentExamData = extra
      this.curExamIndex = value
      this.changePieData()
      this.showBaseLine()
    },
    changeGradeMenu() {
      this.chartData.categories = this.gradeAndTermExamList[0].subjects.map(v => v.name)
      this.chartData.series = this.gradeAndTermExamList.map(v => ({
        name: v.examName,
        data: v.subjects.map(s => s.value),
      }))
    },
  },
}
</script>
<style lang="scss">
  .exam-menu{
    margin-top: 10upx;
  }
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
