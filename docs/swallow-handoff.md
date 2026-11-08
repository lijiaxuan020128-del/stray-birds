# 金腰燕接入说明

源文件：用户提供金腰燕.zip、金腰燕(1).png。

保留四只粒子、错峰飞入、泥地取泥、沿稳定曲线直接飞离及返回的原始逻辑和时长。不恢复旧版随机转向，也不引入 distance/debugMode/key 等与 p5 冲突的全局名字。仅改背景路径、将画布挂到 main；main 根据视口保持完整16:9。背景JPEG保留原尺寸、quality94。

新增 birds/red-rumped-swallow/，依赖本地 p5.js 2.3.4。统一介绍页配置在 birds/view/index.html；路由在 assets/immersive.js；目录鼠标交互配置在 assets/heron-catalog-particles.js，半径4与家燕一致，深蓝#23385D、描边#E9C59B。必须同时接入三处，不能仅上传效果目录。

工作台 assets/swallow-workbench.js 添加原图Data URL、鸟名及效果链接，使用现有保存机制，不覆盖 published-book.js 或用户目录。index.html 与 immersive.js 加载版本同步更新。

生态说明参考：https://datacenter.kiz.ac.cn/DataBase/BirdDetail/451 和 https://www.guokr.com/article/449444/ 。动画中的数量、时长和路线是用户提供的表现方案，不代表实测速率。
