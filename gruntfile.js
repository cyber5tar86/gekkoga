module.exports = function(grunt){
  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    browserify: {
      dist: {
        options: {
          transform: [
            ['babelify', {presets: ['latest']}]
          ]
        },
        files: {
          'static/js/app.js': [
            'js/app.js'
          ],
        }
      }
    },

    eslint: {
      target: ['js/**/*.js'],
      options: {
        fix: true
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'static/css/main.css': 'static/sass/base.scss'
        },
      }
    },

    postcss: {
      options: {
        map: false,
        processors: [
          require('pixrem')(),
          require('autoprefixer')({browsers: 'last 4 versions'}),
          require('cssnano')()
        ]
      },
      dist: {
        src: 'static/css/main.css'
      }
    },

    watch: {
      scripts: {
        files: 'js/**/*.js',
        tasks: ['browserify', 'notify:js'],
        options: {
          interrupt: true,
          spawn: false
        },
      },
      sass: {
        files: 'static/sass/**/*.scss',
        tasks: ['sass', 'postcss', 'notify:sass'],
        options: {
          interrupt: true,
          spawn: false
        },
      },
    },

    notify: {
      all: {
        options: {
          title: 'Build finished',  // optional
          message: 'All', //required
        }
      },
      sass: {
        options: {
          title: 'Build finished',  // optional
          message: 'SASS', //required
        }
      },
      js: {
        options: {
          title: 'Build finished',  // optional
          message: 'JS', //required
        }
      },
    }
  });

  grunt.registerTask("lint", ["eslint"]);
  grunt.registerTask("default", [
    "browserify",
    "sass",
    "postcss",
    "notify:all"
  ]);
};
