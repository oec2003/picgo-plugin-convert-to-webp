import path from 'path';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import { PicGo } from 'picgo'

export = (ctx: PicGo) => {
  const handle = async (ctx: PicGo): Promise<PicGo> => {
    // ctx.input 是一个数组，因为都是单个文件上传，所以取数组中第一个数据就行
    // imgPath 得到的就是文件的本地路径
    let [imgPath] = ctx.input;
    let imgExt= path.extname(imgPath);
    //如果上传的就是 webp 格式的文件直接返回
    if (imgExt === '.webp') {
      return ctx;
    }
    //将文件转为 webp 格式的流
    let imgBuffer = await sharp(imgPath)
      .webp()
      .toBuffer();

    //得到 webp 文件的本地路径
    const webpPath =path.join(path.dirname(imgPath), path.basename(imgPath, imgExt) + '.webp');
    //将 webp 文件写入本地，我是想要在本地保留 webp 文件的备份
    // 如果不需要，也可以在 afterUploadPlugins 事件中将本地文件删除
    await fs.writeFile(webpPath, imgBuffer);

    //将新的 webp 地址包装为数组返回给  ctx 的 input 对象 
    ctx.input = [webpPath]

    return ctx;
  };

  const register = () => {
    //注意：此处需要使用 beforeTransformPlugins 事件
    ctx.helper.beforeTransformPlugins.register('picgo-plugin-convert-to-webp', {
      handle
    });
  }
  
  return {
    register
  }
}
