const { resolve } = require('path')
const { writeFileSync, existsSync, unlinkSync } = require('fs')
const StreamTool = require('./lib/stream')


// 清理生成的 JSON 文件

const deleteAndTouchFile = file => {
    if (file && existsSync(file)) {
      try {
        unlinkSync(file)
        console.log(`已删除 ${file}`)
      } catch (err) {
        console.log(err)
      }
    }
  
    try {
      writeFileSync(file, '')
      console.log(`已创建空的 ${file}`)
    } catch (err) {
      console.log(err)
    }
  }
function merge() {
  const dir = resolve(__dirname, './json')
  const mergeJson = resolve(__dirname, './merger.json')
  if(!existsSync(dir)) {
    console.log('不存在目录,请在当前项目下新建json文件夹');
    return
  }
  deleteAndTouchFile(mergeJson)
  const st = new StreamTool({ dir, dest: mergeJson, highWaterMark: 2 })
  st.merge()
 }
 merge();