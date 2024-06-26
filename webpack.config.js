const { watch, watchFile } = require('fs');
const path = require('path');
module.exports = {
  entry: './src/main.ts',
  output: {
    filename: './dist/bundle.js',
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'inline-source-map',
  resolve: {
    // Add '.ts' as resolvable extensions.
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, '.'), // 서버의 루트 디렉토리
    compress: false, // 압축 옵션
    port: 8080, // 개발 서버 포트
    hot: true, // 핫 모듈 리플레이스먼트 활성화
    open: true, // 브라우저 자동 열기
  },
  // Omit "externals" if you don't have any. Just an example because it's
  // common to have them.
  externals: {
    // Don't bundle giant dependencies, instead assume they're available in
    // the html doc as global variables node module name -> JS global
    // through which it is available
    //"pixi.js": "PIXI"
  },
  optimization: {
    minimize: false,
  },
};
