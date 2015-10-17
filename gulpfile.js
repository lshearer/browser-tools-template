/*eslint-disable */

var fs = require('fs');
var path = require('path');
var spawn = require('win-spawn');
var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var makeWebpackConfig = require('./make-webpack-config');
var babel = require('gulp-babel');
var rimraf = require('rimraf');
var mocha = require('gulp-mocha');
var chalk = require('chalk');
var eslint = require('gulp-eslint');
var reporter = process.env['MOCHAREPORTER'] || 'spec';

gulp.task('watch', ['build:dev'], function() {
  gulp.watch(['src/**/*.js', 'src/**/*.scss'], ['build:dev']);
});

gulp.task('build:dev', webpackBuild.bind(null, {
  debug: true
}));

gulp.task('build', ['clean'], webpackBuild.bind(null, {
  debug: false
}));

function webpackBuild(options) {
  return new Promise(function(resolve, reject) {
    // run webpack
    webpack(makeWebpackConfig(options), function(err, stats) {
      if (err) {
        throw new gutil.PluginError('webpack', err);
      }
      gutil.log('[webpack]', stats.toString({}));
      resolve();
    });
  });
}

gulp.task('clean', function(cb) {
  rimraf('./dist', cb);
});

// Implementing linting as a gulp task for now because as a loader it doesn't
// seem to be doing anything.
gulp.task('lint', function() {
  return gulp.src(['src/**/*.js'])
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});

// Publishing (adapted from hudl-gulp-multiverse-app: https://github.com/hudl/js-hudl-gulp-multiverse-app/blob/e94f58b9d6af5b1b7ed2d865a535b416de538c92/gulpfile.js#L36-L95)
// Prevents (in conjunction with the package.json `prepublish` hook) publishing via a direct call to `npm publish` and requires `gulp publish`

// Triggered by npm prepublish script hook. Used to prevent directly calling `npm publish`.
gulp.task('npm-prepublish', function() {
  // Retrieve the original command-line arguments from the npm call
  var args = process.env.npm_config_argv;
  if (!args) {
    throw new TypeError('Expecting npm_config_argv environment variable. ' +
      'Either this command is not being run from npm or perhaps ' +
      'the version of npm is not new enough (can\'t confirm when this feature was added).');
  }
  args = JSON.parse(args);

  // Fail script if `npm publish` was called without the gulp-specific flag used to differentiate calls.
  // Need to ensure this was actually triggered by a publish command because `npm install <noargs>` on a local
  // project also triggers the prepublish script hook (it's gross, I know...)
  if (args.original && args.original.indexOf('publish') >= 0 && args.original.indexOf('--with-gulp-publish') === -1) {
    throw new Error(chalk.bgRed('`npm publish` not allowed for this package.') + ' Use  ' + chalk.cyan('`gulp publish`') + ' instead.');
  }
});


// Task that can be used to see if anything else needs done before actually deciding to publish the package
gulp.task('prepublish', ['build', 'lint'], function() {
  // todo
  // - git ensure no uncommitted changes
  // - git fetch
  // - merge in master branch
  // - run linting
  // x run tests
  // - ensure changelog entry (at least for major version change)
});

gulp.task('publish', ['prepublish'], function() {

  // todo - finish these steps; may need to add a postpublish to scripts config of package.json
  // - npm version
  // x npm publish
  // - merge into master(?)

  console.log(chalk.green('\u2713 Prepublish checks complete. Publishing package...'));

  return new Promise(function(resolve, reject) {
    var publish = spawn('npm', ['publish', '--with-gulp-publish'], {
      stdio: 'inherit'
    });

    var slowMessageTimeout = setTimeout(function() {
      // TODO pull registry server URL from package.json or npm_package_**
      console.log(chalk.yellow('`npm publish` seems to be a bit slow. If it appears to be stalled, ensure you can connect to `http://npm.thorhudl.com`.'));
    }, 10000);

    publish.on('close', function(code) {
      clearTimeout(slowMessageTimeout);
      if (code > 0) {
        reject(new gutil.PluginError('publish', chalk.cyan('npm publish') + ' encountered an error. There should be more information above.'));
      } else {
        resolve();
      }
    });
  });
});
