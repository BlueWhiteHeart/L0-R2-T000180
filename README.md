
## [项目说明]

K2-L0-R2 中英文 JSON 合并工具

---

## [项目任务]

- 细节：文件(夹)是否存在检查/文件合法检查/文件读取错误提示/多文件并发读取

---

## 使用说明

#### 生成大文件 JSON 资源

在项目`/json`文件夹下写入大量待合并的 `JSON`文件

#### 启动服务

```sh
node index.js
```

#### 执行结果说明

```javascript
  const st = new StreamTool({ dir, dest: stdest, highWaterMark: 2 })
  st.merge()
```

---

## 项目结构说明

```sh
$ tree -I node_modules
.
L0-R2-T000180

├── README.md                                 # 项目通用说明
├── index.js                                  # 项目主功能入口
├── json                                      # json文件夹下存放需要合并的文件
├── lib                                       # 处理合并的代码文件
│   ├── stream.js
├── merger.json                               # 最终合并的json文件
└── package.json                              # 项目依赖和版本相关说明
├── .gitignore                                # 项目 git 提交忽略文件说明

1 directories, 6 files
```

## License

ISC

---
