import { BasicPipeline, Vibrant } from '@vibrant/core'
import { BrowserImage } from '@vibrant/image-browser'
import { DefaultGenerator } from '@vibrant/generator-default'
import { MMCQ } from '@vibrant/quantizer-mmcq'

// 与 node-vibrant/browser 的默认流程一致，仅引入浏览器图像实现
const pipeline = new BasicPipeline()
  .filter.register('default', (r, g, b, a) => a >= 125 && !(r > 250 && g > 250 && b > 250))
  .quantizer.register('mmcq', MMCQ)
  .generator.register('default', DefaultGenerator)

Vibrant.DefaultOpts.ImageClass = BrowserImage
Vibrant.DefaultOpts.quantizer = 'mmcq'
Vibrant.DefaultOpts.generators = ['default']
Vibrant.DefaultOpts.filters = ['default']
const registerPipeline = Vibrant.use.bind(Vibrant)
registerPipeline(pipeline)

export { Vibrant }
