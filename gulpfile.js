var fs = require('fs');
var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
var rename = require("gulp-rename");
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');
var argv = require('yargs').argv;

var parallel = 5;

gulp.task('less', function () {

  var dest = './build';
  return gulp.src('./src/less/*.less')
    .pipe(less({
      plugins: [autoprefix]
    }))
    .pipe(rename("styles.css"))
    .pipe(gulp.dest(dest))
    .pipe(cssmin())
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest(dest));

});

gulp.task('scripts', function () {

  var dest = './build';
  return gulp.src('./src/js/*.js')
    .pipe(rename('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dest));

});


gulp.task('files', function () {

  var srcDir = './src/';
  var buildDir = './build/';

  // copy images
  gulp.src(srcDir + 'img/**/*')
    .pipe(gulp.dest(buildDir + 'img/'));

  // copy sounds
  gulp.src(srcDir + 'sounds/**/*')
    .pipe(gulp.dest(buildDir + 'sounds/'));

  // copy files
  gulp.src(srcDir + '*.*')
    .pipe(gulp.dest(buildDir));

});

gulp.task('upload', function () {

  var tempSettings = getSettings();
  var conn = createFtpConn(tempSettings);

  gulp.watch(globs)
    .on('change', function (event) {
      console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type);

      return gulp.src([event.path], { base: './src', buffer: false })
        .pipe(conn.newer(tempSettings.remotePath))
        .pipe(conn.dest(tempSettings.remotePath))
        ;
    });

});

gulp.task('deploy', ['less', 'scripts', 'files'], function () {
  var tempSettings = getSettings();
  var conn = createFtpConn(tempSettings);
  return gulp.src(['./build/**/*'], { base: './build', buffer: false })
    .pipe(conn.newer(tempSettings.remotePath))
    .pipe(conn.dest(tempSettings.remotePath));
});


gulp.task('build', ['less','scripts','files'], function () {

  // placeholder

});

function createFtpConn(paramSettings) {
  return ftp.create({
    host: paramSettings.host,
    port: paramSettings.port,
    user: paramSettings.username,
    password: paramSettings.password,
    parallel: parallel,
    log: gutil.log
  });
}

function getSettings() {
  var settings = JSON.parse(fs.readFileSync("./ftp.json"));
  var thisSettings = settings.staging;
  if (argv.production) {
    thisSettings = settings.production;
  }
  return thisSettings;
}