<template>
<view class="container">
  <gradePicker title="年级" :grade="reportData.grade" :term="reportData.term"
               @change="changeGrade"></gradePicker>
  <u-cell-group title="考试信息" class="lzy-cell-group">
    <u-field v-model="reportData.examName" label="考试名称" maxlength="12" focus
             placeholder="请输入考试名称" />
    <u-cell-item title="考试日期" :value="reportData.examDateText"
              arrow-direction="down" @click="showDatePopup"></u-cell-item>
    <u-picker mode="time" v-model="show" :params="params" @confirm="changeDate"></u-picker>
  </u-cell-group>

  <u-cell-group title="排名信息" class="lzy-cell-group">
    <u-field v-model="reportData.rankClass" label="班级排名" maxlength="3" type="number"
             placeholder="请输入班级排名"></u-field>
    <u-field v-model="reportData.rankGrade" label="年级排名" maxlength="5" type="number"
             placeholder="请输入年级排名"></u-field>

  </u-cell-group>

  <u-cell-group title="科目信息" class="lzy-cell-group">
    <u-field v-for="(item, index) in reportData.subjects" :key="item.name"
               :value="item.value" :label="item.name" maxlength="5"
               :placeholder="'本次' + item.name + '得分'" type="digit"
               @input="val=>changeSubjectFullScore(val, index)">
      <view slot="right-icon">({{item.full}}分)</view>
    </u-field>
    <view class="flex no-subject">
      <view class="no-subject-text">没有我的课程？</view>
      <view class="no-subject-btn" @tap="goConfig">去配置</view>
    </view>
  </u-cell-group>
  <u-cell-group :title="'总分 (' + total + ')'" class="total-score lzy-cell-group">
    <u-circle-progress :percent="reportData.rate" layer-color="#f6f6f6"
                stroke-width="6" :color="gradientColor">
      得分 {{reportData.score}}
    </u-circle-progress>
  </u-cell-group>
  <u-cell-group title="统计" class="lzy-cell-group">
     <u-cell-item title="平均分" :value="reportData.average" :arrow="false"></u-cell-item>
     <u-cell-item title="最高分" :value="maxScore" :arrow="false"></u-cell-item>
     <u-cell-item title="最低分" :value="minScore" :arrow="false"></u-cell-item>
  </u-cell-group>

  <view class="pb-3">
    <u-button class="btn confirm-btn padding-btn" open-type="getUserInfo" :loading="loading"
              ripple @click="submit" @getuserinfo="getUserInfo">
      {{subjectId ? '更新': '保存'}}
    </u-button>
    <u-button class="btn normal-btn padding-btn" ripple @click="reset" type="info">重置</u-button>
  </view>

</view>
</template>

<script>
import dayjs from 'dayjs'
import gradePicker from 'components/gradePicker/index.vue'
import {defaultSubjects, gradeColumn} from '@/utils/enum'
import {wxCloudCallFunction} from '@/utils/request'

const app = getApp()
const defaultReportData = {
  grade: '初三',
  term: '上学期',
  subjects: defaultSubjects,
  score: 0,
  rate: 0,
  average: 0,
  examName: '',
  examDate: new Date().getTime(),
  examDateText: dayjs().format('YYYY-MM-DD'),
  rankClass: 0,
  rankGrade: 0,
}

export default {
  data() {
    return {
      show: false,
      reportData: defaultReportData,
      columns: gradeColumn,
      subjectId: '',
      loading: false,
      // gradientColor: {
      //   '0%': '#3fecff',
      //   '100%': '#6149f6',
      // },
      params: {
        year: true,
        month: true,
        day: true,
        timestamp: true,
      },
      maxScore: 0,
      minScore: 0,
    }
  },

  components: {
    gradePicker,
  },
  onLoad() {

  },

  onShow(e) {
    const id = (e && e.id) || app.globalData.recordId || this.subjectId
    this.setGradeTerm()
    if (id) {
      this.getScores(id)
    } else {
      this.getSubject()
    }
  },
  computed: {
    total() {
      return this.reportData.subjects.reduce((pre, cur) => Number(cur.full) + pre, 0)
    },
  },

  methods: {
    showDatePopup() {
      this.show = true
    },
    changeGrade({ grade, term }) {
      this.reportData.grade = grade
      this.reportData.term = term
      this.getSubject()
    },

    changeDate({ timestamp }) {
      const realTimestamp = timestamp * 1000
      this.reportData.examDate = realTimestamp
      this.reportData.examDateText = dayjs(realTimestamp).format('YYYY-MM-DD')
      this.show = false
    },
    changeSubjectFullScore(value, index) {
      const _subjects = [...this.reportData.subjects]
      const full = _subjects[index].full

      if (value > parseInt(full, 10)) {
        this.$showToast('不能超过满分')
        const preValue = this.reportData.subjects[index].value
        _subjects[index].value = preValue.substring(0, String(full).length - 1)
      } else {
        _subjects[index].value = value
      }

      this.reportData.subjects = _subjects
      this.computeTotalScores(_subjects)
    },

    submit() {
      const {
        examDate,
        examName,
        subjectId,
      } = this.reportData
      const subjects = [...this.reportData.subjects]

      if (!examName) {
        this.$showToast('请输入考试名称')
        return
      }
      if (!examDate) {
        this.$showToast('请输入考试日期')
        return
      }
      const emptyTarget = subjects.find(v => !v.value || !v.value > 0)

      if (emptyTarget) {
        this.$showToast(emptyTarget.name + '为空')
        return
      }

      const name = subjectId ? 'update' : 'add'
      const actionName = subjectId ? '更新' : '保存'
      this.loading = true
      if (subjectId) {
        this.reportData._id = subjectId
      }
      uni.showLoading({
        title: '数据提交中...',
      })
      wxCloudCallFunction(name, {
        collectionName: 'scores',
        ...this.reportData,
      }).then(res => {
        uni.showToast({ title: actionName + '成功' })
        this.reportData.subjectId = res._id
      }).finally(() => {
        uni.hideLoading()
        this.loading = false
      })
    },

    computeTotalScores(subjects) {
      let minScore = subjects[0].value
      let maxScore = 0
      const score = subjects.reduce((pre, { value }) => {
        if (value) {
          if (value > maxScore) {
            maxScore = value
          }
          if (value < minScore) {
            minScore = value
          }
          return Number(value) + pre
        }
        return pre
      }, 0)
      console.log(minScore, maxScore)
      this.minScore = minScore
      this.maxScore = maxScore
      this.reportData.score = score
      this.reportData.rate = ((score / this.total).toFixed(2)) * 100
      this.reportData.average = (score / subjects.length).toFixed(2)
    },

    getSubject() {
      uni.showLoading({
        title: '加载中',
      })
      wxCloudCallFunction('findAll', {
        collectionName: 'gradeSubject',
        grade: this.reportData.grade,
      }).then(({
        data,
      }) => {
        if (data && data.length) {
          this.reportData.subjects = data[0].subjects
        } else {
          this.$showToast('未查询到相关信息，使用默认课程信息')
          this.reportData.subjects = defaultSubjects
          this.subjectId = ''
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

    getScores(id) {
      uni.showLoading({
        title: '加载中',
      })
      wxCloudCallFunction('findOne', {
        collectionName: 'scores',
        _id: id,
      }).then(({
        data,
      }) => {
        app.globalData.recordId = ''

        if (data) {
          const subjects = data.subjects
          this.subjectId = id
          this.reportData = data
          this.computeTotalScores(subjects)
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

    goConfig() {
      uni.navigateTo({
        url: '/pages/subjectSetting/index',
      })
    },

    getUserInfo(e) {
      if (!app.globalData.userInfo) {
        const detail = e.detail
        wxCloudCallFunction('addUser', {
          collectionName: 'users',
          ...detail,
        }).then(res => {
          app.globalData.userInfo = detail.userInfo
          console.log(res)
        })
      }
    },

    reset() {
      this.subjectId = ''
      this.reportData = defaultReportData
      this.setGradeTerm()
      this.getSubject()
    },

    setGradeTerm() {
      const userInfo = app.globalData.userInfo
      if (userInfo && userInfo.grade) {
        this.reportData.grade = userInfo.grade
        this.reportData.term = userInfo.term
      }
    },

  },
}
</script>

<style lang="scss">
  .total-score{
    text-align: center;
  }
  .no-subject{
    font-size: 30rpx;
    color: #ccc;
    justify-content: center;
    align-items: center;
    padding: 10rpx;
    background: #fff;
    .no-subject-text{

    }
    .no-subject-btn{
      color: #1296db;
    }
  }

</style>
