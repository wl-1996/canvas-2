//获取canvas元素：
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
//功能按钮：
let brush = document.getElementById('brush');
let eraser = document.getElementById('eraser');
let undo = document.getElementById('undo');
let reSetCanvas = document.getElementById('clear');
let save = document.getElementById('save');
//画笔颜色选择按钮：
let colorBtn = document.getElementsByClassName('color-item');
//画笔粗细拖拽按钮：
let range = document.getElementById('range');

//设置信号量：
//默认非橡皮擦状态
let clear = false;
//画笔默认宽度为4
let lWidth = 4;

//设置画布尺寸
autoSetSize(canvas);
//我感觉多次一举，画板默认就是白色啊，只需要给一个默认画笔填充颜色就可以了啊
setCanvasBg('white');
//设置画笔默认样式：
ctx.fillStyle = 'black';
ctx.strokeStyle = 'black';

//监听用户操作
listenToUser(canvas);
//根据颜色按钮获取画笔颜色
getColor();

//窗口被关闭/刷新时，触发该事件：
window.onbeforeunload = () => {
    return 'Reload site?';
};

//定义设置画布尺寸函数
function autoSetSize(canvas) {
    //定义设置画布尺寸函数
    function canvasSetSize() {
        let clientWidth = document.documentElement.clientWidth;
        let clientHeight = document.documentElement.clientHeight;
        canvas.width = clientWidth;
        canvas.height = clientHeight;
    }

    canvasSetSize();
    //视口变化时画布尺寸重新设置：
    window.onresize = () => {
        canvasSetSize();
    };
}

//设置画板背景函数：
function setCanvasBg(color) {
    //设置填充颜色
    ctx.fillStyle = color;
    //绘制一个填充矩形：
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//定义画点函数：
function drawPoint(x, y) {
    //what?
    ctx.save();
    //如果此时是橡皮擦状态：
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
}

//定义画线函数：
function drawLine(x1, y1, x2, y2) {
    //样式初始化
    ctx.lineWidth = lWidth;
    //lineCap和lineJoin作用是画线时无缝隙，使其顺滑
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    //如果现在是橡皮擦状态：
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
    let painting = false;
    //最后坐标信号量：
    let lastPoint = {x: undefined, y: undefined};
    //判断是否是手机设备（通过触摸API判断）
    if (document.body.ontouchstart !== undefined) {
        //触摸开始时画一个点
        canvas.ontouchstart = function (e) {
            //ctx.getImageData返回一个ImageData对象，用来描述canvas区域隐含的像素数据，
            //这个区域通过矩形表示，起始点为(sx, sy)、宽为sw、高为sh。
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            saveData(imageData);
            painting = true;
            let x = e.touches[0].clientX;
            let y = e.touches[0].clientY;
            lastPoint = {x: x, y: y};
            // 通过将当前状态放入栈中，保存 canvas 全部状态的方法。
            ctx.save();
            //调用画点函数：
            drawPoint(x, y);
        };
        // 触摸移动时画线
        canvas.ontouchmove = function (e) {
            if (painting) {
                let x = e.touches[0].clientX;
                let y = e.touches[0].clientY;
                let newPoint = {x: x, y: y};
                //调用画线函数：
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
                //更新信号量：
                lastPoint = newPoint;
            }
        };
        // 触摸结束时重置绘画状态信号量：
        canvas.ontouchend = function () {
            painting = false;
        };
    } else {
        //鼠标按下时画一个点
        canvas.onmousedown = function (e) {
            //ctx.getImageData返回一个ImageData对象，用来描述canvas区域隐含的像素数据，
            //这个区域通过矩形表示，起始点为(sx, sy)、宽为sw、高为sh。
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            saveData(imageData);
            painting = true;
            let x = e.clientX;
            let y = e.clientY;
            lastPoint = {x: x, y: y};
            // 通过将当前状态放入栈中，保存 canvas 全部状态的方法。
            ctx.save();
            //调用画点函数：
            drawPoint(x, y);
        };
        // 鼠标按下移动时画线
        canvas.onmousemove = function (e) {
            // 判断信号量是否为true,为true时才能画线
            if (painting) {
                let x = e.clientX;
                let y = e.clientY;
                let newPoint = {x: x, y: y};
                //调用画线函数：
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
                //更新信号量：
                lastPoint = newPoint;
            }
        };
        // 鼠标抬起时重置绘画状态信号量：
        canvas.onmouseup = function () {
            painting = false;
        };
    }
}

//监听画笔宽度拖动按钮的变化事件：
//当按钮值变化时，更新画笔的粗细
range.onchange = function () {
    lWidth = this.value;
    console.log(lWidth);
};

//橡皮擦按钮点击事件：
eraser.onclick = function () {
    this.classList.add('active');
    brush.classList.remove('active');
    clear = true;
};

//监听画笔点击事件
brush.onclick = function () {
    this.classList.add('active');
    eraser.classList.remove('active');
    clear = false;
};

//清空按钮点击事件
reSetCanvas.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

//根据颜色按钮选中状态设置填充颜色和轮廓颜色：
function getColor() {
    //遍历colorBtn按钮，给所有按钮添加点击事件：
    for (let i = 0; i < colorBtn.length; i++) {
        colorBtn[i].onclick = function () {
            //先去掉所有的按钮的类：active
            //原生js无兄弟节点的API，所以只能再次遍历：
            for (let j = 0; j < colorBtn.length; j++) {
                colorBtn[j].classList.remove('active');
            }
            //给被点击的颜色按钮加上类active：
            this.classList.add('active');
            ctx.fillStyle = this.style.backgroundColor;
            ctx.strokeStyle = this.style.backgroundColor;
        };
    }
}

let history = [];//该数组存放历史记录
//保存历史记录函数：
function saveData(imageData) {
    //如果历史记录已经有10条了，就删除第一条再进行存储
    //这是为了防止卡顿，如果保存太多会卡
    (history.length === 10) && (history.shift());
    history.push(imageData);
}

undo.onclick = function () {
    console.log(history);
    if (history.length === 0) {
        window.alert('您已经撤销到尽头，无法继续撤销');
        return;
    }
    let imageData = history[history.length - 1];
    // ctx.putImageData将数据从已有的 ImageData 对象绘制到位图的方法。
    //就是说将上次保存的ImageData对象渲染到画布上
    ctx.putImageData(imageData, 0, 0);
    history.pop();
};

//保存按钮监听，点击后保存图片，这个很有用啊
save.onclick = function () {
    // getDataURL方法返回一个包含图片展示的 data URI
    //就是将当前画板的内容变为一个url
    let imgUrl = canvas.toDataURL("image/png");
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.href = imgUrl;
    // 此属性指示浏览器下载 URL 而不是导航到它，
    // 因此将提示用户将其保存为本地文件。如果属性有一个值，那么此值将在下载保存过程中作为预填充的文件名
    a.download = "wangkuo" + (new Date).getTime();
    a.target = "_blank";
    // click 方法可以用来模拟鼠标左键单击一个元素。
    a.click();
};

