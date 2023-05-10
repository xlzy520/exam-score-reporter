# 中学生考试成绩记录小程序
给妹妹做的一个记录每次考试的成绩小程序，以便于知道每次考试的详细情况。基于
[uniapp-tailwind-uview-starter](https://github.com/xlzy520/uniapp-tailwind-uview-starter)

### GitHub
[GitHub 项目地址](https://github.com/xlzy520/exam-score-reporter)

### 小程序预览
![](https://i.loli.net/2021/06/22/OEYuLT6vq2ejdNQ.jpg)
 

### 安装启动
1. 在[这里](https://github.com/xlzy520/exam-score-reporter/blob/8b97105f92fa3ac5f6e7c2f50d31fddb2f127785/src/App.vue#L48)把云函数环境改成你这里
2. 云函数文件存储在`static/cloudfunctions-tcb`中（**一定要记得关联云空间、上传云函数啊**），需要每个云函数都上传
2. 云数据库表: `scores`，`gradeSubject`，`users`, `report`
3. `yarn`或者`npm`安装依赖
4. 具体参考[uniapp-tailwind-uview-starter](https://github.com/xlzy520/uniapp-tailwind-uview-starter)启动项目

### 主要功能
- 课程配置
    - 自定义课程配置
    - 满分配置
- 成绩登记
    - 平均分
    - 总分
    - 班级排名
    - 年级排名
- 记录查看
    - 按年级分组查看
    - 图表查看
    - 两次考试成绩对比
