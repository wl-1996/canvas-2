// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"epB2":[function(require,module,exports) {
//获取canvas元素：
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d'); //功能按钮：

var brush = document.getElementById('brush');
var eraser = document.getElementById('eraser');
var undo = document.getElementById('undo');
var reSetCanvas = document.getElementById('clear');
var save = document.getElementById('save'); //画笔颜色选择按钮：

var colorBtn = document.getElementsByClassName('color-item'); //画笔粗细拖拽按钮：

var range = document.getElementById('range'); //设置信号量：
//默认非橡皮擦状态

var clear = false; //画笔默认宽度为4

var lWidth = 4; //设置画布尺寸

autoSetSize(canvas); //我感觉多次一举，画板默认就是白色啊，只需要给一个默认画笔填充颜色就可以了啊

setCanvasBg('white'); //设置画笔默认样式：

ctx.fillStyle = 'black';
ctx.strokeStyle = 'black'; //监听用户操作

listenToUser(canvas); //根据颜色按钮获取画笔颜色

getColor(); //窗口被关闭/刷新时，触发该事件：

window.onbeforeunload = function () {
  return 'Reload site?';
}; //定义设置画布尺寸函数


function autoSetSize(canvas) {
  //定义设置画布尺寸函数
  function canvasSetSize() {
    var clientWidth = document.documentElement.clientWidth;
    var clientHeight = document.documentElement.clientHeight;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
  }

  canvasSetSize(); //视口变化时画布尺寸重新设置：

  window.onresize = function () {
    canvasSetSize();
  };
} //设置画板背景函数：


function setCanvasBg(color) {
  //设置填充颜色
  ctx.fillStyle = color; //绘制一个填充矩形：

  ctx.fillRect(0, 0, canvas.width, canvas.height);
} //定义画点函数：


function drawPoint(x, y) {
  //what?
  ctx.save(); //如果此时是橡皮擦状态：

  if (clear) {
    //what?
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    //画点（逻辑就是画一个圆，填充这个圆）
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
    console.log("画点成功");
  }
} //定义画线函数：


function drawLine(x1, y1, x2, y2) {
  //样式初始化
  ctx.lineWidth = lWidth; //lineCap和lineJoin作用是画线时无缝隙，使其顺滑

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round'; //如果现在是橡皮擦状态：

  if (clear) {
    //what?
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function listenToUser(canvas) {
  //设置信号量
  //当前绘制状态信号量
  var painting = false; //最后坐标信号量：

  var lastPoint = {
    x: undefined,
    y: undefined
  }; //判断是否是手机设备（通过触摸API判断）

  if (document.body.ontouchstart !== undefined) {
    //触摸开始时画一个点
    canvas.ontouchstart = function (e) {
      //ctx.getImageData返回一个ImageData对象，用来描述canvas区域隐含的像素数据，
      //这个区域通过矩形表示，起始点为(sx, sy)、宽为sw、高为sh。
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      saveData(imageData);
      painting = true;
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;
      lastPoint = {
        x: x,
        y: y
      }; // 通过将当前状态放入栈中，保存 canvas 全部状态的方法。

      ctx.save(); //调用画点函数：

      drawPoint(x, y);
    }; // 触摸移动时画线


    canvas.ontouchmove = function (e) {
      if (painting) {
        var x = e.touches[0].clientX;
        var y = e.touches[0].clientY;
        var newPoint = {
          x: x,
          y: y
        }; //调用画线函数：

        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y); //更新信号量：

        lastPoint = newPoint;
      }
    }; // 触摸结束时重置绘画状态信号量：


    canvas.ontouchend = function () {
      painting = false;
    };
  } else {
    //鼠标按下时画一个点
    canvas.onmousedown = function (e) {
      //ctx.getImageData返回一个ImageData对象，用来描述canvas区域隐含的像素数据，
      //这个区域通过矩形表示，起始点为(sx, sy)、宽为sw、高为sh。
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      saveData(imageData);
      painting = true;
      var x = e.clientX;
      var y = e.clientY;
      lastPoint = {
        x: x,
        y: y
      }; // 通过将当前状态放入栈中，保存 canvas 全部状态的方法。

      ctx.save(); //调用画点函数：

      drawPoint(x, y);
    }; // 鼠标按下移动时画线


    canvas.onmousemove = function (e) {
      // 判断信号量是否为true,为true时才能画线
      if (painting) {
        var x = e.clientX;
        var y = e.clientY;
        var newPoint = {
          x: x,
          y: y
        }; //调用画线函数：

        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y); //更新信号量：

        lastPoint = newPoint;
      }
    }; // 鼠标抬起时重置绘画状态信号量：


    canvas.onmouseup = function () {
      painting = false;
    };
  }
} //监听画笔宽度拖动按钮的变化事件：
//当按钮值变化时，更新画笔的粗细


range.onchange = function () {
  lWidth = this.value;
  console.log(lWidth);
}; //橡皮擦按钮点击事件：


eraser.onclick = function () {
  this.classList.add('active');
  brush.classList.remove('active');
  clear = true;
}; //监听画笔点击事件


brush.onclick = function () {
  this.classList.add('active');
  eraser.classList.remove('active');
  clear = false;
}; //清空按钮点击事件


reSetCanvas.onclick = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}; //根据颜色按钮选中状态设置填充颜色和轮廓颜色：


function getColor() {
  //遍历colorBtn按钮，给所有按钮添加点击事件：
  for (var i = 0; i < colorBtn.length; i++) {
    colorBtn[i].onclick = function () {
      //先去掉所有的按钮的类：active
      //原生js无兄弟节点的API，所以只能再次遍历：
      for (var j = 0; j < colorBtn.length; j++) {
        colorBtn[j].classList.remove('active');
      } //给被点击的颜色按钮加上类active：


      this.classList.add('active');
      ctx.fillStyle = this.style.backgroundColor;
      ctx.strokeStyle = this.style.backgroundColor;
    };
  }
}

var history = []; //该数组存放历史记录
//保存历史记录函数：

function saveData(imageData) {
  //如果历史记录已经有10条了，就删除第一条再进行存储
  //这是为了防止卡顿，如果保存太多会卡
  history.length === 10 && history.shift();
  history.push(imageData);
}

undo.onclick = function () {
  console.log(history);

  if (history.length === 0) {
    window.alert('您已经撤销到尽头，无法继续撤销');
    return;
  }

  var imageData = history[history.length - 1]; // ctx.putImageData将数据从已有的 ImageData 对象绘制到位图的方法。
  //就是说将上次保存的ImageData对象渲染到画布上

  ctx.putImageData(imageData, 0, 0);
  history.pop();
}; //保存按钮监听，点击后保存图片，这个很有用啊


save.onclick = function () {
  // getDataURL方法返回一个包含图片展示的 data URI
  //就是将当前画板的内容变为一个url
  var imgUrl = canvas.toDataURL("image/png");
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.href = imgUrl; // 此属性指示浏览器下载 URL 而不是导航到它，
  // 因此将提示用户将其保存为本地文件。如果属性有一个值，那么此值将在下载保存过程中作为预填充的文件名

  a.download = "wangkuo" + new Date().getTime();
  a.target = "_blank"; // click 方法可以用来模拟鼠标左键单击一个元素。

  a.click();
};
},{}]},{},["epB2"], null)
//# sourceMappingURL=main.8dff0f28.js.map