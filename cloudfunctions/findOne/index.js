// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  traceUser: true,
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { collectionName, ...params } = event
  try {
    return await db.collection(collectionName).where({
      open_id: OPENID,
      ...params,
    }).get()
  } catch (e) {
    console.error(e)
  }
}
