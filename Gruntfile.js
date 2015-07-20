module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores: ['node_modules/**/*.js','bower_components/**/*.js']
      },
      all: [
        './**/*.js'
      ],
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint']);

};
