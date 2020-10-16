import { gradeColumn } from '../../utils/enum'

const app = getApp()
Page({
  data: {
    userType: 0,
    show: false,
    columns: [
      {
        values: [1, 2],
        className: 'column1',
      },
      {
        values: [],
        className: 'column2',
        defaultIndex: 2,
      }
    ],
    grade: '初三',
  },
  onLoad() {

  },
  onShow() {

  },
  showPopup() {
    this.setData({ show: true })
  },
  onClose() {
    this.setData({ show: false })
  },
  onConfirm(event) {
    const { value } = event.detail

    this.setData({
      grade: value,
      show: false,
    }, () => {
    })
  },
})
