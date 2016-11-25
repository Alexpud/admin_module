var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass'),
  shell = require('gulp-shell');

gulp.task('docker.sock', shell.task(
  [
    'sudo chmod 777 /var/run/docker.sock'
  ],
  {
    verbose: true
  }
));

gulp.task('styles',function()
{
  gulp.src('./public/js/angular/assets/css/style.scss')
  .pipe(sass().on('error',sass.logError))
  .pipe(gulp.dest('./public/js/angular/assets/css'));
});

gulp.task('database', shell.task(
  [
    'docker start mysql_nginx'
  ]
));

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js coffee handlebars',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('default', [
  'develop'
]);
