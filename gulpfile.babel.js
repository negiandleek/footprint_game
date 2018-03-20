import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import rimraf from 'rimraf'
import runSequence from 'run-sequence'
import browserSync from 'browser-sync'
import browserify from 'browserify'
import babelify from 'babelify'
import watchify from 'watchify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
// import pngquant from 'imagemin-pngquant'
import historyApiFallback from 'connect-history-api-fallback'

var seq = runSequence.use(gulp)
var $ = gulpLoadPlugins({
    camelize: true
})
var path = {
    public: 'public/',
    browserifyCache: '.browserify-cache/',
    static: 'static/',
    styleEntrypoint: 'main.scss',
    jsEntrypoint: 'main.js',
    js: 'public/javascripts/',
    style: 'public/stylesheets/',
    publish: 'public/publish/',
    jsFiles: '**/*.{js,jsx,es6}',
    mediaFiles: '**/*.{mp4,webm,ogv,ogg,mp3,ogg,wav,aiff}',
    imageFiles: '**/*.{jpg,jpeg,gif,png,svg}',
}
var opts = {
    isWatching: false,
    isDebug: false
}

gulp.task('build:sass', function() {
    return $.rubySass(path.style + path.styleEntrypoint)
        .on('error', function (err) {
            console.error('Error!', err.message)
         })
        .pipe($.cached('sass'))
        .pipe($.plumber())
        .pipe($.pleeease({
          autoprefixer: {
              browsers: ['last 5 versions']
          },
          minifier: true
        }))
        .pipe(gulp.dest(path.static))
        .pipe($.notify({
            message: 'Styles task complete'
        }))
})
/**
 * browserify
 * es6のファイルをトランスパイラで変換し、.browserifyCacheへ格納する。
 * .browserifyCacheへ格納したファイルをwatchifyで監視し、差分更新する
 */
gulp.task('babel', (cb) => {
    return gulp.src(path.js + path.jsFiles)
        .pipe($.cached('mv:js'))
        .pipe($.plumber())
        .pipe(gulp.dest(path.browserifyCache))
})

function compile() {
    // custom browserify options
    var b = browserify({
        entries: [path.browserifyCache + path.jsEntrypoint],
        debug: opts.isDebug,
        extensions: ['.js', '.json', '.es6']
    })
    b.transform(babelify)
    // add transformations
    if (opts.isWatching) {
        b = watchify(b)
        b.on('update', bundle)
        b.on('log', function(log) {
            console.log(log)
        })
    } else {
        b.transform({
            global: true
        }, 'uglifyify')
    }

    function bundle() {
        var _bundle = b.bundle().on('error', function() {
                var args = Array.prototype.slice.call(arguments)
                $.notify.onError({
                    title: 'Compile Error',
                    message: '<%= error %>'
                }).apply(this, args)
                this.emit('end')
            })
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(gulp.dest(path.static))
            if (opts.isDebug) {
                _bundle = _bundle.pipe($.sourcemaps.init({
                    loadMaps: true
                })) // loads map from browserify file
                .pipe($.sourcemaps.write('./'))
            }
        return _bundle
    }
    return bundle()
}
gulp.task('build:js', (cb) => {
    compile()
    cb()
})

// Html
gulp.task('mv:html', (cb) => {
    return gulp.src(path.public + '{,**/}*.html')
        .pipe($.plumber())
        .pipe(gulp.dest(path.static))
})

// Sounds
gulp.task('mv:sounds', (cb) => {
    return gulp.src(path.public + path.mediaFiles)
        .pipe($.plumber())
        .pipe(gulp.dest(path.static))
})

// Images
gulp.task('mv:images', (cb) => {
    return gulp.src(path.public + path.imageFiles)
        .pipe($.plumber())
        .pipe(gulp.dest(path.static))
})

// P
gulp.task('mv:publish', (cb) => {
    return gulp.src(path.publish + '**/*')
            .pipe($.plumber())
            .pipe(gulp.dest(path.static + 'publish/'))
})

gulp.task('min:images', (cb) => {
  return gulp.src(path.static + path.imageFiles)
    .pipe($.imagemin({
        progressive: true,
        svgoPlugins: [{
            removeViewBox: false
        }],
        use: [pngquant()]
    })).
    pipe(gulp.dest(path.static))
})

gulp.task('min:html', (cb) => {
  return gulp.src(path.static + '/**/*.html')
        .pipe($.htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(path.tmp))
})

gulp.task('enable:watch-mode', (cb) => {
    opts.isWatching = true
    cb()
})
gulp.task('enable:debug-mode', (cb) => {
    opts.isDebug = true
    cb()
})
gulp.task('clean:tmpdir', (cb) => {
    rimraf(path.browserifyCache, cb)
})
gulp.task('clean:distdir', (cb) => {
  rimraf(path.static, cb)
})

gulp.task('watch', (cb) => {
    browserSync.init(null,{
        server:{
            baseDir: path.static,
            port: 3000,
            notify: true,
            stream: true
        }
    });

    $.watch([path.public + '**/*.html'], function(cb) {
        seq('mv:html',browserSync.reload);
    });
    $.watch([path.public + '**/*.scss'], function(cb) {
        seq('build:sass',browserSync.reload);
    });
    $.watch([path.public + '**/*.{gif,jpg,jpeg,png,svg}'], function(cb) {
        seq('mv:images',browserSync.reload);
    });
    $.watch([path.public + '**/*.{mp3,ogg,wav}'], function(cb) {
        seq('mv:sounds',browserSync.reload);
    });
    $.watch([path.public + '**/*.json'], function(cb){
        seq('mv:json', browserSync.reload);
    });
    $.watch([path.js + '**/*'], function(cb) {
        seq('babel');
    })
    $.watch([path.static + '{,**/}*.js'], function(cb){
        browserSync.reload();
    })
})

gulp.task('default', (cb) => {
    seq('clean:tmpdir',
        'enable:debug-mode',
        'enable:watch-mode',
        ['build:sass', 'mv:html', 'mv:images', 'mv:sounds', 'mv:publish','babel'],
        'build:js',
        'watch',
        'clean:tmpdir',
        cb)
})
/*gulp.task('build', (cb) => {
    seq('clean:tmpdir','clean:distdir',
        ['build:sass', 'mv:html', 'mv:images', 'mv:sounds','babel'],
        'build:js',
        ['min:images', 'min:html'],
        'publish',
        'clean:tmpdir',
        cb)
})*/