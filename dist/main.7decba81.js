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
// 阻止微信浏览器默认向下滚动：
// 同时惊喜的我发现也可以解决QQ浏览器页面滑动问题：
document.body.addEventListener('touchmove', function (e) {
  e.preventDefault();
}, {
  passive: false
});
var canvas = document.getElementById("drawing-board");
var ctx = canvas.getContext("2d");
var eraser = document.getElementById("eraser");
var brush = document.getElementById("brush");
var reSetCanvas = document.getElementById("clear");
var aColorBtn = document.getElementsByClassName("color-item");
var save = document.getElementById("save");
var undo = document.getElementById("undo");
var range = document.getElementById("range"); //信号量，是否要清空

var clear = false; //默认画笔颜色：

var activeColor = 'black'; //默认画笔线条宽度是4

var lWidth = 4; //设置画板尺寸

autoSetSize(canvas); //设置画板背景颜色

setCanvasBg('white');
listenToUser(canvas); //获取默认颜色：

getColor(); //在刷新页面前弹出确认框

window.onbeforeunload = function () {
  return "Reload site?";
}; //定义设置画板尺寸函数


function autoSetSize(canvas) {
  canvasSetSize(); //定义设置画板尺寸函数核心代码：

  function canvasSetSize() {
    var pageWidth = document.documentElement.clientWidth;
    var pageHeight = document.documentElement.clientHeight;
    console.log(pageWidth, pageHeight);
    canvas.width = pageWidth;
    canvas.height = pageHeight;
  } //当window视口改变尺寸时调用设置画板尺寸函数


  window.onresize = function () {
    canvasSetSize();
  };
} //定义设置画板背景颜色函数：


function setCanvasBg(color) {
  ctx.fillStyle = color;
  console.log(color); //画一个矩形区域，这个矩形区域覆盖画板区域

  ctx.fillRect(0, 0, canvas.width, canvas.height); //what?怎么重复了

  ctx.fillStyle = 'black';
}

function listenToUser(canvas) {
  //设置默认不是绘画状态：
  var painting = false; //设置一个坐标

  var lastPoint = {
    x: undefined,
    y: undefined
  }; //通过触摸API判断是否是手机设备
  //手机设备监听的是触摸开始，触摸移动，触摸结束事件：

  if (document.body.ontouchstart !== undefined) {
    //监听触摸开始事件：
    canvas.ontouchstart = function (e) {
      //在这里储存绘图表面
      // this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      //调用saveData函数保存这个记录
      // saveData(this.firstDot);
      //触摸开始了，设置绘画状态为true：
      painting = true; //获取触摸的坐标：

      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY; //将此时触摸坐标作为最后一次坐标

      lastPoint = {
        "x": x,
        "y": y
      }; //？

      ctx.save(); //调用画圆函数画一个圆点,半径为0

      drawCircle(x, y, 0);
    }; //监听手机端手指滑动事件：


    canvas.ontouchmove = function (e) {
      //先判断绘画状态是否为true，为true时才能进行绘画：
      if (painting) {
        //获取移动后的坐标：
        var x = e.touches[0].clientX;
        var y = e.touches[0].clientY;
        var newPoint = {
          "x": x,
          "y": y
        }; //调用画线函数画一条线将这两个点连接起来：

        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y); //然后更新最后一个点：

        lastPoint = newPoint;
      }
    }; //监听触摸结束事件：


    canvas.ontouchend = function () {
      //触摸结束了，将绘画状态设为false：
      painting = false;
    };
  } //否则就是PC设备
  //PC设备监听的是鼠标按下，鼠标移动，鼠标抬起事件：
  else {
      //监听鼠标按下事件：
      canvas.onmousedown = function (e) {
        //在这里储存绘图表面
        // this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height);//在这里储存绘图表面
        // saveData(this.firstDot);
        //鼠标按下就将绘画状态设为true：
        painting = true; //获取按下坐标：

        var x = e.clientX;
        var y = e.clientY;
        lastPoint = {
          "x": x,
          "y": y
        }; //？

        ctx.save(); //以这个坐标为圆心画一个圆：

        drawCircle(x, y, 0, clear);
      }; //监听鼠标移动事件：


      canvas.onmousemove = function (e) {
        //判断绘画状态是否为true，为true时才可以移动过程中继续画线
        if (painting) {
          //获取坐标：
          var x = e.clientX;
          var y = e.clientY;
          var newPoint = {
            "x": x,
            "y": y
          }; //调用画线函数：
          //但是不知道clear参数是干什么的？

          drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, clear); //画完线后更新最后一个点的坐标

          lastPoint = newPoint;
        }
      }; //监听鼠标抬起事件，将绘画状态设为false：


      canvas.onmouseup = function () {
        painting = false;
      }; //比手机端多监听一个鼠标离开事件：
      //鼠标离开时将绘画状态设为false：
      //否则的话鼠标离开后抬起再进入还是会画线：


      canvas.mouseleave = function () {
        painting = false;
      };
    }
} //画圆函数：
//给圆心坐标和半径就能得到一个圆：


function drawCircle(x, y, radius) {
  ctx.save();
  ctx.beginPath();
  console.log(radius);
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill(); //如果clear为true：

  if (clear) {
    //what?
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
} //画线函数，给两组坐标返回一条线：


function drawLine(x1, y1, x2, y2) {
  //设置线的宽度：
  ctx.lineWidth = lWidth; //what?

  ctx.lineCap = "round";
  ctx.lineJoin = "round"; //如果clear这个信号量为true：

  if (clear) {
    //？
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    //？
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }
} //监听range的change事件，一旦改变了，就将rang的值设为线的宽度：


range.onchange = function () {
  //这里的this就是这个range元素：
  lWidth = this.value;
}; //监听橡皮擦按钮点击事件：


eraser.onclick = function () {
  //说明此时要清除内容了：
  clear = true;
  this.classList.add("active");
  brush.classList.remove("active");
}; //监听画笔按钮点击事件：


brush.onclick = function () {
  //说明此时要画画，不是要清除内容：
  clear = false;
  this.classList.add("active");
  eraser.classList.remove("active");
}; //监听清空按钮点击事件


reSetCanvas.onclick = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBg('white');
}; //监听保存按钮点击事件，点击保存时生成img图片保存到本机：


save.onclick = function () {
  var imgUrl = canvas.toDataURL("image/png");
  var saveA = document.createElement("a");
  document.body.appendChild(saveA);
  saveA.href = imgUrl;
  saveA.download = "zspic" + new Date().getTime();
  saveA.target = "_blank";
  saveA.click();
}; //定义获取颜色函数：


function getColor() {
  for (var i = 0; i < aColorBtn.length; i++) {
    aColorBtn[i].onclick = function () {
      for (var _i = 0; _i < aColorBtn.length; _i++) {
        //去掉所有颜色按钮的active类：
        aColorBtn[_i].classList.remove("active"); //给被点击的这个按钮加上颜色类


        this.classList.add("active");
        activeColor = this.style.backgroundColor;
        ctx.fillStyle = activeColor;
        ctx.strokeStyle = activeColor;
      }
    };
  }
}

var historyDeta = []; //声明一个保存历史记录的函数：
// function saveData(data) {
//     (historyDeta.length === 10) && (historyDeta.shift());// 上限为储存10步，太多了怕挂掉
//     historyDeta.push(data);
// }
//监听撤销按钮点击事件：
// undo.onclick = function () {
//     if (historyDeta.length < 1) return false;
//     ctx.putImageData(historyDeta[historyDeta.length - 1], 0, 0);
//     historyDeta.pop();
// };
},{}]},{},["epB2"], null)
//# sourceMappingURL=main.7decba81.js.map