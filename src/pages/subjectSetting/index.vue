<template>
<view class="container">
  <gradePicker title="年级" :grade="grade" :term="term" @change="changeGrade"></gradePicker>
  <u-popup v-model="show" mode="center">
    <view class="p-4 w-64">
      <u-field v-model="subjectName" label="科目名称" maxlength="6" focus placeholder="请输入科目名称" />
      <u-button class="padding-btn" @click="addNewSubject" type="primary">
        提交
      </u-button>
    </view>
  </u-popup>

  <u-cell-group title="科目信息及满分" class="lzy-cell-group">
    <u-field v-for="(item, index) in subjects" :key="index" v-model="item.full" :label="item.name"
               maxlength="3" :placeholder="'请输入'+item.name + '满分值'"
               type="number">
      <u-icon slot="right" name="close-circle" size="42" @click="deleteSubject(index)"></u-icon>
    </u-field>
  </u-cell-group>

  <u-button class="padding-btn" type="primary" plain ripple @click="showPopup">
    <view class="layout-items-center">
      <u-icon name="plus"></u-icon>
      增加科目信息
    </view>
  </u-button>
  <u-button class="padding-btn" @click="submit" :loading="loading" type="primary">
    {{subjectId ? '更新': '保存'}}
  </u-button>

</view>
</template>

<script>
import { wxCloudCallFunction } from '@/utils/request'
import { defaultSubjects, gradeColumn } from '@/utils/enum'
import gradePicker from '@/components/gradePicker/index.vue'

const app = getApp()

export default {
  data() {
    return {
      show: false,
      columns: gradeColumn,
      grade: '初三',
      term: '上学期',
      subjects: defaultSubjects,
      subjectName: '',
      subjectId: '',
      loading: false,
    }
  },

  components: {
    gradePicker,
  },
  props: {},

  onLoad() {
    this.setGradeTerm()
    this.getSubject()
  },

  methods: {
    showPopup() {
      this.show = true
    },
    changeGrade(data) {
      console.log(data);
      const { grade, term } = data
      this.grade = grade
      this.term = term
      this.getSubject()
    },

    addNewSubject() {
      const subjectName = this.subjectName

      if (!subjectName) {
        this.$showToast('科目名称不能为空')
        return
      }
      const target = this.subjects.find(v => v.name === subjectName)
      if (target) {
        this.$showToast('已存在相同的科目名称')
        return
      }
      const _subjects = [...this.subjects]
      _subjects.push({
        name: subjectName,
        full: '',
      })
      this.show = false
      this.subjects = _subjects
      this.subjectName = ''
    },

    deleteSubject(index) {
      const _subjects = [...this.subjects]
      _subjects.splice(index, 1)
      this.subjects = _subjects
    },

    submit() {
      const subjects = [...this.subjects]
      const errSubject = subjects.find(v => !v.full || v.full <= 0)
      if (errSubject) {
        this.$showToast(`${errSubject.name}分值不能为空`)
        return
      }

      const name = this.subjectId ? 'update' : 'add'
      const actionName = this.subjectId ? '更新' : '保存'
      this.loading = true
      wxCloudCallFunction(name, {
        collectionName: 'gradeSubject',
        grade: this.grade,
        subjects: this.subjects,
        term: this.term,
      }).then(res => {
        uni.showToast({ title: actionName + '成功' })

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
      wxCloudCallFunction('findAll', {
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
          this.$showToast('未查询到相关信息，使用默认课程信息')
          this.subjectId = ''
          this.subjects = defaultSubjects
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

  },
}
</script>
<style lang="scss">
</style>
