// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  traceUser: true,
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID,
  } = cloud.getWXContext()
  const { collectionName, ...params } = event
  const curDB = db.collection('' + collectionName + '')
  if (params.open_id) {
    return await curDB.update({
      data: {
        open_id: OPENID,
        ...params,
        createdTime: new Date().getTime(),
      },
    })
  }
  // 需要前后加字符串，否则会出现一直添加在第一张表上的情况
  return await curDB.add({
    data: {
      open_id: OPENID,
      ...params,
      createdTime: new Date().getTime(),
    },
  })
}
