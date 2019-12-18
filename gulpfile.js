const gulp = require('gulp'),
      babel = require('gulp-babel'),
      sass = require('gulp-sass'),
      prefix = require('gulp-autoprefixer'),
      postcss = require("gulp-postcss"),
      autoprefixer = require("autoprefixer"),
      sourcemaps = require("gulp-sourcemaps"),
      concat = require('gulp-concat'),
	  uglify = require('gulp-uglify'),
      rename = require('gulp-rename'),
      htmlreplace = require('gulp-html-replace'),
      del = require('del'),
      cssmin = require('gulp-cssmin'),
      browserSync = require('browser-sync').create();

const paths = {
    styles: {
        src: './assets/sass/main.scss',
        watch: ['./assets/sass/*.scss', './assets/sass/layouts/*.scss'],
        dest: './assets/css',
        dist: './dist/assets/css'
    },
    scripts: {
        src: [
            './assets/js/jquery-3.3.1.slim.min.js',
            './assets/js/bootstrap.min.js',
            './assets/js/scripts.js'
        ],
        watch: ['./assets/js/scripts/*.js', './assets/js/scripts.js'],
        dest: './assets/js',
        dist: './dist/assets/js'
    }
};

function style() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on("error", sass.logError)
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function script() {
    return gulp
        .src(paths.scripts.src)
        .pipe(babel({
			presets: ['@babel/preset-env']
		}))
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

function minifyStyles() {
    return gulp.src("assets/css/main.css")
        .pipe(cssmin())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(paths.styles.dist));
}

function minifyScripts() {
    return gulp.src("assets/js/main.js")
        .pipe(uglify())
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dist));
}

function reload() {
    browserSync.reload();
}

function serveAndWatch() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(paths.styles.watch, style);
    gulp.watch(paths.scripts.src, script);
    gulp.watch(['*.html', '*.php']).on('change', browserSync.reload);
}

async function clean() {
    const result = del(['dist', 'assets/css/main.css*', 'assets/js/main*.js*']);
    await Promise.resolve(result);
}

function buildAssets() {
    return gulp.src([
		'*.html',
		'*.php',
		'favicon.ico',
        "assets/img/**",
        "media/**"
	], { base: './'})
		.pipe(gulp.dest('dist'));
}

function renameSources() {
    return gulp.src(['*.html', '**/*.php', '!dist', '!dist/**'])
        .pipe(htmlreplace({
            'js': 'assets/js/main.min.js',
            'css': 'assets/css/main.min.css'
        }))
        .pipe(gulp.dest('dist/'));
}

exports.serveAndWatch = serveAndWatch;
exports.style = style;
exports.script = script;
exports.minifyScripts = minifyScripts;
exports.minifyStyles = minifyStyles;
exports.clean = clean;

const serve = gulp.series(style, script, serveAndWatch);

const build = gulp.series(clean, style, script, minifyStyles, minifyScripts, buildAssets, renameSources);

gulp.task('build', build);

gulp.task('serve', serve);

gulp.task('default', serve);
