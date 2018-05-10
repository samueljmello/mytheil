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
var browserSync = require('browser-sync').create();
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');
var argv = require('yargs').argv;
var sequence = require('gulp-sequence')

var parallel = 5;
var srcDir = './src/';
var buildDir = './build/';
var buildWatch = [
  buildDir + 'index.html', 
  buildDir + 'styles.css', 
  buildDir + 'styles.min.css', 
  buildDir + 'scripts.min.js', 
  buildDir + '**/*'
];

gulp.task('less', function () {
  return gulp.src(srcDir + 'less/*.less')
    .pipe(less({
      plugins: [autoprefix]
    }))
    .pipe(rename("styles.css"))
    .pipe(gulp.dest(buildDir))
    .pipe(cssmin())
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest(buildDir));
});

gulp.task('scripts', function () {
  return gulp.src(srcDir + 'js/*.js')
    .pipe(rename('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(buildDir));
});


gulp.task('files', function () {
  gulp.src(srcDir + 'img/*').pipe(gulp.dest(buildDir + 'img/'));
  gulp.src(srcDir + 'sounds/*').pipe(gulp.dest(buildDir + 'sounds/'));
  gulp.src(srcDir + 'index.html').pipe(gulp.dest(buildDir));
});

gulp.task('build', sequence('less','scripts','files'));

gulp.task('deploy', ['build'], function () {
  deploy();
});
gulp.task('upload', function () {
  deploy();
});

gulp.task('live', ['build'], function () {
  liveWatch();
  gulp.watch(buildWatch, ['upload']);
});

gulp.task('dev', ['build'], function () {
  liveWatch();
  gulp.watch(buildWatch).on('change', browserSync.reload);
  browserSync.init({
    server: {
      baseDir: buildDir
    }
  });
});

function deploy() {
  var tempSettings = getSettings();
  var conn = createFtpConn(tempSettings);
  return gulp.src(buildWatch, { base: buildDir, buffer: false })
    .pipe(conn.newerOrDifferentSize(tempSettings.remotePath))
    .pipe(conn.dest(tempSettings.remotePath));
}

function liveWatch() {
  gulp.watch(srcDir + '*.*', ['files']);
  gulp.watch(srcDir + '(img|sounds)/*', ['files']);
  gulp.watch(srcDir + 'js/*.js', ['scripts']);
  gulp.watch(srcDir + 'less/styles.less', ['less']);
}

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