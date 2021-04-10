<template>
<view class="container">
  <gradePicker title="年级" :grade="grade" :term="term" @change="changeGrade"></gradePicker>
  <u-popup :show="show" position="bottom" @close="onClose">
    <view>
      <u-field :value="subjectName" @change="changeSubjectName"
                 label="科目名称" auto-focus placeholder="请输入科目名称" />
      <u-button class="padding-btn" block round @tap="addNewSubject" type="primary">
        提交
      </u-button>
    </view>
  </u-popup>

  <u-cell-group title="科目信息及满分">
    <u-field v-for="(item, index) in subjects"
               :key="index" :value="item.full" :label="item.name"
               maxlength="3" :placeholder="item.name + '满分'"
               :error="subjectErrors[index]"
               type="number" @change="evt=>changeSubjectFullScore(evt, index)">
      <u-icon slot="right-icon" name="close" @tap="deleteSubject"></u-icon>
    </u-field>
  </u-cell-group>

  <u-button class="padding-btn" block round
              @tap="showPopup"
              color="linear-gradient(to right, #4bb0ff, #6149f6)">
    <view class="df flex-center">
      <u-icon name="plus"></u-icon>
      增加科目信息
    </view>
  </u-button>
  <u-button class="padding-btn" block round
              @tap="submit" :loading="loading" loading-type="spinner"
              :loading-text="loadingText + '中'" type="danger">
    {{subjectId ? '更新': '保存'}}
  </u-button>


</view>
</template>

<script>
import { defaultSubjects, gradeColumn } from '../../utils/enum'
import gradePicker from '../../components/gradePicker/index.vue'

const api = require('../../utils/api.js')

const app = getApp()

export default {
  data() {
    return {
      show: false,
      columns: gradeColumn,
      grade: '初三',
      term: '上学期',
      subjects: defaultSubjects,
      subjectErrors: [],
      subjectName: '',
      subjectId: '',
      loading: false,
      loadingText: '',
    }
  },

  components: {
    gradePicker,
  },
  props: {},

  onLoad() {
    this.getSubject()
    this.setGradeTerm()
  },

  methods: {
    changeSubjectName(evt) {
      this.subjectName = evt.detail
    },
    showPopup() {
      this.show = true
    },
    onClose() {
      this.show = false
    },

    changeGrade(evt) {
      const [grade, term] = evt.detail
      this.grade = grade
      this.term = term
      this.getSubject()
    },

    addNewSubject() {
      const subjectName = this.subjectName

      if (!subjectName) {
        Toast('科目名称不能为空')
        return
      }

      const _subjects = [...this.subjects]
      _subjects.push({
        name: subjectName,
        full: '',
      })
      this.onClose()
      this.subjects = _subjects
      this.subjectName = ''
    },

    deleteSubject(evt) {
      const index = evt.target.dataset.index
      const _subjects = [...this.subjects]
      _subjects.splice(index, 1)
      this.subjects = _subjects
    },

    changeSubjectFullScore(evt, index) {
      const value = evt.detail
      const _subjects = [...this.subjects]
      _subjects[index].full = value
      this.subjects = _subjects
      this.subjectErrors = []
    },

    submit() {
      const subjects = [...this.subjects]
      let hasEmpty = false
      const subjectErrors = subjects.map(v => {
        if (!v.full || !v.full > 0) {
          hasEmpty = true
          return true
        }
        return false
      })

      if (hasEmpty) {
        this.subjectErrors = subjectErrors
        Toast('存在不合法的输入')
        return
      }

      const name = this.subjectId ? 'update' : 'add'
      const actionName = this.subjectId ? '更新' : '保存'
      this.loading = true
      this.loadingText = actionName
      api.wxCloudCallFunction(name, {
        collectionName: 'gradeSubject',
        grade: this.grade,
        subjects: this.subjects,
        term: this.term,
      }).then(res => {
        Toast(actionName + '成功')
        this.subjectId = res._id
        console.log(res)
      }).finally(() => {
        this.loading = false
      })
    },

    setGradeTerm() {
      const userInfo = app.globalData.userInfo

      if (userInfo && userInfo.grade) {
        this.grade = userInfo.grade
        this.term = userInfo.term
      }
    },

    getSubject() {
      uni.showLoading({
        title: '加载中',
      })
      api.wxCloudCallFunction('findAll', {
        collectionName: 'gradeSubject',
        grade: this.grade,
        term: this.term,
      }).then(({
        data,
      }) => {
        if (data && data.length) {
          this.subjects = data && data[0].subjects
          this.subjectId = data[0]._id
        } else {
          Toast('未查询到相关信息，使用默认课程信息')
          // this.subjects = defaultSubjects
          this.subjectId = ''
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

  },
}
</script>
<style>

</style>
