const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;
const imgDir = 'D:/img';
const publicDir = path.join(__dirname, '..','public');

// 中间件配置
app.use(cors());
app.use(express.static(publicDir));
app.use('/images', express.static(imgDir));

// HTML页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// 分页API，返回图片信息
app.get('/api/images', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 99999;
    const keyword = (req.query.keyword || '').trim().toLowerCase();
    let files = (await fs.readdir(imgDir))
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

    // 关键词过滤
    if (keyword) {
      files = files.filter(f => f.toLowerCase().includes(keyword));
    }

    // 分页逻辑
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedFiles = files.slice(start, end);

    // 构造图片信息
    const imageList = paginatedFiles.map((filename, idx) => ({
      url: `/images/${filename}`,
      alt: `图片${start + idx + 1}`,
      caption: `${filename}`,
      width: 1920,
      height: 1080
    }));

    res.json({
      code: 0,
      data: imageList,
      pagination: {
        page,
        limit,
        total: files.length
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 1,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 启动服务
app.listen(port, () => {
  console.log(`服务已启动:
  网页地址: http://localhost:${port}
  图片目录: ${imgDir}
  API端点: http://localhost:${port}/api/images`);
});
