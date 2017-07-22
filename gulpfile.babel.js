import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import jasmineNode from 'gulp-jasmine-node';
import istanbul from 'gulp-istanbul';
import injectModules from 'gulp-inject-modules';
import exit from 'gulp-exit';
import coveralls from 'gulp-coveralls';
import yaml from 'gulp-yaml';

gulp.task('yamltojson', () => {
  gulp.src('./api/swagger/swagger.yaml')
    .pipe(yaml({ schema: 'DEFAULT_SAFE_SCHEMA' }))
    .pipe(gulp.dest('./public/'));
});

gulp.task('nodemon', () => {
  nodemon({
    script: 'build/server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['server']
  });
});

gulp.task('dev', () => {
  return gulp.src('server/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'stage-2']
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['dev', 'nodemon'], () => {
  gulp.watch('server/**/*.js', ['dev']);
  gulp.watch('./api/swagger/swagger.yaml', ['yamltojson']);
});

const jasmineNodeOpts = {
  timeout: 50000,
  includeStackTrace: false,
  color: true
};

gulp.task('api-tests', () => {
  gulp.src('./test/**/*.js')
    .pipe(babel())
    .pipe(jasmineNode(jasmineNodeOpts));
});

gulp.task('coverage', (cb) => {
  gulp.src('build/controllers/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src('test/server/*.js')
      .pipe(babel())
      .pipe(injectModules())
      .pipe(jasmineNode())
      .pipe(istanbul.writeReports())
      .pipe(istanbul.enforceThresholds({ thresholds: { global: 30 } }))
      .on('end', cb)
      .pipe(exit());
    });
});

gulp.task('coveralls', () => {
  return gulp.src('./coverage/lcov')
    .pipe(coveralls());
});