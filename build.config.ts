import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/main',
  ],
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  failOnWarn: false,
  declaration: true,
})
