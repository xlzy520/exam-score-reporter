<template>
  <u-dropdown class="">
    <u-dropdown-item :value="grade" :options="gradeMenu"
                       @change="changeGradeMenu" />
    <u-dropdown-item :value="term" :options="termMenu"
                       @change="changeTermMenu" />
  </u-dropdown>
</template>

<script>
import { gradeAndTermColumn, gradeColumn, termColumn } from 'utils/enum'

const gradeMenu = gradeColumn.map((value, index) => ({ text: value, value }))
const termMenu = termColumn.map((value, index) => ({ text: value, value }))

export default {
  data() {
    return {
      show: false,
      columns: gradeAndTermColumn,
      gradeMenu,
      termMenu,
    }
  },

  components: {},
  props: {
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

  },
  options: {
    styleIsolation: 'apply-shared',
  },

  methods: {
    changeGradeMenu(evt) {
      const { detail } = evt
      this.$emit('change', { grade: detail, term: this.term })
    },
    changeTermMenu(evt) {
      const { detail } = evt
      this.$emit('change', { grade: this.grade, term: detail })
    },
  },
}
</script>
