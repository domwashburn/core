/* DEPENDENCIES */
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import babelify from 'babelify';
import historyApiFallback from 'connect-history-api-fallback';
import assign from 'lodash.assign';
import path from 'path';
import watchify from 'watchify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import strictify from 'strictify';
import {stream as wiredep} from 'wiredep';
import mochaPhantomjs from 'gulp-mocha-phantomjs';
import { argv } from  'yargs';

const $ = gulpLoadPlugins({
    rename: {
        'gulp-util': 'gutil'
    }
});
const reload = browserSync.reload;

let PATHS = { 
  src: './src', 
  dist: './dist', 
  stat: './static', 
  ghp: './gh-pages' 
};

PATHS.app_html = path.join(PATHS.src);
// source folder paths
PATHS.src_styles = path.join(PATHS.src, 'styles');
PATHS.src_images = path.join(PATHS.src, 'images');
PATHS.src_scripts = path.join(PATHS.src, 'scripts');
PATHS.src_fonts = path.join(PATHS.src, 'fonts');
// distribution folder paths
PATHS.dist_styles = path.join(PATHS.dist, 'styles');
PATHS.dist_images = path.join(PATHS.dist, 'images');
PATHS.dist_scripts = path.join(PATHS.dist, 'scripts');
PATHS.dist_fonts = path.join(PATHS.dist_styles, 'fonts');
// GitHub Pages folder paths
PATHS.ghp_styles = path.join(PATHS.ghp, 'styles');
PATHS.ghp_images = path.join(PATHS.ghp, 'images');
PATHS.ghp_scripts = path.join(PATHS.ghp, 'scripts');
PATHS.ghp_fonts = path.join(PATHS.ghp_styles, 'fonts');
// sample page asset paths

// static folder paths
PATHS.static_styles = path.join(PATHS.stat, 'styles');
PATHS.static_images = path.join(PATHS.stat, 'images');
PATHS.static_scripts = path.join(PATHS.stat, 'scripts');
PATHS.static_fonts = path.join(PATHS.static_styles, 'fonts');

let { app_html } = PATHS;
let { src, src_styles, src_scripts, src_fonts } = PATHS;
let { dist, dist_styles, dist_images, dist_scripts, dist_fonts } = PATHS;
let { ghp, ghp_styles, ghp_images, ghp_scripts, ghp_fonts } = PATHS;
let { stat, static_styles, static_images, static_scripts, static_fonts } = PATHS; 
// static is a reserved word ... so, stat works for now

let PrecompiledCSS = [ ];

gulp.task('styles', () => {
    return gulp.src([
        ...PrecompiledCSS,
        src_styles + '/scss/*.scss'
      ])
        .pipe( $.plumber() )
        .pipe( $.sass.sync({
          outputStyle: 'expanded',
          precision: 10,
          includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe( $.autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
        }))
        // concatenate and compile un-minified css for the dev environment
        .pipe( $.concatCss("style.css") )
        .pipe( $.if( !argv.build, $.sourcemaps.init({loadMaps: true}) ))
        .pipe( $.if( !argv.build, $.sourcemaps.write('./') ))
        .pipe( $.if( !argv.build, gulp.dest( static_styles )) )

        // minify css for the distribution, static, and GitHub Pages only when running `gulp --build`
        .pipe( $.if( argv.build, $.cleanCss() ))
        .pipe( $.if( argv.build, $.rename( 
          function(path){ 
            path.basename += '.min';
          })
        ))
        .pipe( $.if( argv.build, $.sourcemaps.init({loadMaps: true}) ))
        .pipe( $.if( argv.build, $.sourcemaps.write('./') ))
        .pipe( $.if( argv.build, gulp.dest( static_styles ) ))
        .pipe( $.if( argv.build, gulp.dest( dist_styles ) ))
        .pipe( $.if( argv.build, gulp.dest( ghp_styles ) ))
        .pipe(reload({
            stream: true
        }));
});

function bundle(b) {
  b.bundle()
  .on('error', (err) => {
    $.gutil.log($.gutil.colors.red('Browserify'), err.toString());
    $.gutil.beep();
  })
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe($.sourcemaps.init({loadMaps: true}))
  .pipe($.sourcemaps.write('./'))
  .pipe( $.if( !argv.build, gulp.dest( static_scripts ) ))
  .pipe( $.if( argv.build, gulp.dest( dist_scripts ) ))
  .pipe(reload({
      stream: true
  }));
}

gulp.task('watchDev', function() {
  let b = browserify({
    entries: [ src_scripts + '/index.js'],
    cache: {},
    packageCache: {},
    plugin: [watchify],
    debug: true
  });
  b.on('log', (message) => {
    $.gutil.log($.gutil.colors.green('Browserify'), message);
  });
  b.on('update', bundle.bind(this, b));
  b.transform(babelify, {presets: ['es2015', 'react', 'stage-1']});
  // b.transform(strictify);
  bundle(b);
});

gulp.task('components', function() {
  return gulp.src([
      "./src/components/*.js"
    ])
    .pipe( $.if( argv.build, $.babel() ))
    .pipe( $.if( argv.build, gulp.dest('dist/components') ));
});

gulp.task('fonts', function() {
    return gulp.src(src_fonts)
        .pipe( $.if( !argv.build, gulp.dest( static_fonts ) ))
        .pipe( $.if( argv.build, gulp.dest( dist_fonts ) ))
        .pipe( $.if( argv.build, gulp.dest( ghp_fonts ) ))
});

gulp.task('images', function() {
    return gulp.src([])
        .pipe( $.if( argv.build, gulp.dest(dist_images) ))
        .pipe( $.if( argv.build, gulp.dest(ghp_images) ))
        .pipe( gulp.dest(static_images) )
});

gulp.task('browser-sync', function() {
    browserSync.init({ 
        server: {
            baseDir: './src',
            routes: {
                '/node_modules' : 'node_modules',
                '/dist' : 'dist',
                '/static' : 'static',
            }
        }
    });
});

gulp.task('watch', function (){
    gulp.watch([
        'src/*.html'
    ]).on('change', reload);
    gulp.watch([ src_styles + '/scss/*.scss', src_styles + '/css/*.css' ], ['styles']);
    // gulp.watch([ src + '/**/*.js', src + '/sample-page/*.js', src + '/sample-page/scripts/*.js'], ['watchDev']);
});

gulp.task('default', [ 'watchDev', 'images', 'fonts', 'styles', 'components', 'watch', 'browser-sync']);

gulp.task('mocha', function() {
  return gulp.src(src + 'test/*.js', {read: false})
    .pipe($.mocha());
});

gulp.task('testWatch', function() {
    gulp.watch([ src + '/**/*.js' ], ['watchDev', 'mocha']);
    gulp.watch([ src + 'test/tests.js' ], ['mocha']);
});

gulp.task('test', ['testWatch', 'watchDev', 'styles', 'mocha']);
