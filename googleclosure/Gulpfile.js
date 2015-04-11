var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');

gulp.task('default', ['watch']);

gulp.task('watch', function() {
  gulp.watch('src/*/*.js', ['compile']);
});

gulp.task('compile', function() {
  gulp.src('src/*/*.js')
    .pipe(closureCompiler({
      compilerPath: 'compiler.jar',
      fileName: 'build.js',
      compilerFlags: {
        language_in: 'ECMASCRIPT5',
        closure_entry_point: 'l3.main',
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        //formatting: 'PRETTY_PRINT',
        define: [
          //"goog.DEBUG=false"
        ],
        externs: [
          'externs/externs.js'
        ],
        extra_annotation_name: 'jsx',
        // Some compiler flags (like --use_types_for_optimization) don't have value. Use null.
        // use_types_for_optimization: null,
        only_closure_dependencies: true,
        output_wrapper: '(function(){%output%})();',
        warning_level: 'VERBOSE'
      }
    }))
    .pipe(gulp.dest('../js'));
});