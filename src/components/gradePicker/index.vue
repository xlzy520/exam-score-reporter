<template>
  <view>
   <u-cell-item :title="title" is-link :icon="icon" :value="currentGrade"
              arrow-direction="down" @click="showPopup" />
    <u-popup :show="show" position="bottom" @close="onClose">
      <u-picker id="picker" :columns="originColumns" @change="change" show-toolbar
                  @cancel="onClose" @confirm="onConfirm" />
    </u-popup>
  </view>
</template>

<script>
import {
  gradeAndTermColumn, gradeColumn, levelColumn, levelGradeEnum, levelIndex
} from '../../utils/enum'

export default {
  data() {
    return {
      show: false,
      originColumns: gradeAndTermColumn,
    }
  },

  components: {},
  props: {
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    grade: {
      type: String,
      default: '初三',
    },
    term: {
      type: String,
      default: '上学期',
    },
  },
  computed: {
    currentGrade() {
      return this.grade + `(${this.term})`
    },
  },
  options: {
    styleIsolation: 'apply-shared',
  },

  methods: {
    change(evt) {
      const { picker, value, index } = evt.detail
      picker.setColumnValues(1, levelGradeEnum[value[0]])
    },
    updateColumns() {
      const picker = this.selectComponent('#picker')
      const columns = JSON.parse(JSON.stringify(this.originColumns))
      const gradeIndexInAll = gradeColumn.findIndex(f => f === this.grade)
      const _levelIndex = levelIndex.findIndex(f => gradeIndexInAll <= f)
      picker.setColumnIndex(0, _levelIndex)
      const currentGradeArr = levelGradeEnum[levelColumn[_levelIndex]]
      const grade = columns[1].values
      const term = columns[2].values
      const gradeIndex = currentGradeArr.findIndex(f => f === this.grade)
      const termIndex = term.findIndex(f => f === this.term)
      console.log(gradeIndexInAll, gradeIndex)

      picker.setColumnIndex(1, gradeIndex)
      picker.setColumnIndex(2, termIndex)
      // columns[0].defaultIndex = _levelIndex
      // columns[1].defaultIndex = gradeIndex
      // columns[1].values = levelGradeEnum[levelColumn[_levelIndex]]
      // columns[0].defaultIndex = grade.findIndex(f => f === this.grade)
      // this.originColumns = columns
    },
    showPopup() {
      this.updateColumns()
      this.show = true
    },

    onClose() {
      this.show = false
    },

    onConfirm(event) {
      const {
        value,
      } = event.detail
      console.log(value)
      value.shift()
      this.$emit('change', { detail: value })
      this.onClose()
    },

  },
}
</script>
