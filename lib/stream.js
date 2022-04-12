'use strict';
const { Readable, Writable } = require('stream');
const { readdirSync, statSync, readFileSync, appendFileSync } = require('fs');
const { resolve, extname } = require('path');
const FSYMBOL = Symbol('files');

class ReadableSteam extends Readable {
  constructor(params) {
    // 流应用在 string 和 Buffer 之外时，需要设置 Object Mode
    params.objectMode = true;
    super(params);
    // this.dir = params.dir;
    this.file = params.file; // 传入的当文件路径
  }
  get files() {
    if (!this[FSYMBOL]) {
      this[FSYMBOL] = [ this.file ];
    }
    return this[FSYMBOL];
  }
  _read() { // 批量读取文件
    for (let i = 0; i < this.files.length; i++) {
      const ifLastFile = (i === (this.files.length - 1));
      this.push({ file: this.files[i], ifLastFile });
    }
    // 当读取到尽头，push null进去，表示读取完毕
    this.push(null);
  }
}
class WriteableSteam extends Writable {
  constructor(params) {
    // 流应用在 string 和 Buffer 之外时，需要设置为 Object Mode
    params.objectMode = true;
    super(params);
    this._encoding = params.encoding || 'utf8'; // 写入编码
    this.dest = params.dest; // 合并到最终文件
    this.keySet = new Set(); // 避免JSON的key重复了
  }
  _write(fileObj, _, cb) {
    const encoding = this.encoding;
    const total = []; // 读取到单个文件中到json数据
    try {
      const data = JSON.parse(readFileSync(fileObj.file, { encoding }));
      for (const key in data) {
        if (!this.keySet.has(key)) {
          this.keySet.add(key);
          total.push(`"${key}":${data[key]}`);
        } else {
         console.log('重复了key=>',key);
        }
      }

    } catch (error) {
      console.log(error, '发生错误');
    }
    if (total.length) {
      appendFileSync(this.dest, total.join(',')); //

      if (!fileObj.isLastFile) {
        appendFileSync(this.dest, ',');
      }
    }
    cb();
  }
}

class SteamTool {
  constructor(options) {
    this.dir = options.dir; // 读取的目录
    this.dest = options.dest; // 合并的路径文件
    this.highWaterMark = options.highWaterMark;
    this.ws = new WriteableSteam({ dest: this.dest, highWaterMark: this.highWaterMark }); // 获取到的写流
  }
  async write() {
    return new Promise((resolveCb, reject) => {
        /*
        1.先一个一个的读取文件流
        2.在一个个通过管道拼接
         */
      const fileArr = readdirSync(this.dir)
        .map(file => resolve(this.dir, file))
        .filter(file => statSync(file).isFile() && extname(file) === '.json');

      for (let i = 0; i < fileArr.length; i++) {
        this.rs = new ReadableSteam({ file: fileArr[i] }); // 获取到的读流
        this.ws.on('error', reject).on('finish', () => {
        console.log('管道输出文件', fileArr[i]);
          if (i === fileArr.length - 1) { // 如果是最后一个文件则全部完成
            resolveCb();
          }
        });
        this.rs.pipe(this.ws);
      }
    });
  }
  async merge() {
    appendFileSync(this.dest, '{');
    await this.write();
    appendFileSync(this.dest, '}');
  }
}
module.exports = SteamTool;
