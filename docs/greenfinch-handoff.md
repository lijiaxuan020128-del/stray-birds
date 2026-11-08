# 金翅雀接入说明

来源：用户提供的金翅雀(1).zip 与金翅雀(2).png。保留原 sketch 的枝条坐标、群飞、返回、停栖和点击行为；只将背景地址改为 background.jpg，并将视口缩放 max 改为 min，避免非16:9窗口裁切。

文件：birds/greenfinch/index.html、sketch.js、background.jpg、artwork.png、p5.js。背景保持1920×1080，JPEG quality94。p5复用仓库已有2.3.4文件，不引入preload，不给loadImage Promise直接调用image。

统一说明页位于 birds/view/index.html 的 D 数据表；同步 assets/immersive.js 的 pages 与 colors；单独打开说明页时 artwork.png 为插画回退。行为与环境沿用共享三栏模板，不另建排版。

工作台入口 assets/greenfinch-workbench.js 由 index.html 加载。按钮插在上传按钮后，将原图读取成Data URL加入当前目录，并关联效果页。在封面点击会转到第一张目录。调用现有 renumberBirds、changed、render，用户完成排版后使用原保存按钮。不要覆盖 published-book.js 或用户本地存储来强行加入新鸟。

发布：更新改动脚本的版本参数；所有资源用Git blob/tree/commit一次提交；使用expected_sha防止覆盖并发修改；检查Pages部署成功，再检查线上图像与添加按钮。

大文件通过49152字节分块读取Base64，逐块验证长度后在工具编排变量内拼接，直接create_blob，不将Base64打印到对话。p5可复用已有blob SHA。

习性参考：https://avifauna.hkbws.org.hk/species/0450/055400 ；https://plant.sdut.edu.cn/2026/0327/c11083a560762/page.htm 。树枝标定、分批起飞和停留时长属于交互设计抽象，并非生态测量数据。
