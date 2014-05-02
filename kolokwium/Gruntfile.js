module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.initConfig({
        compress: {
            main: {
                options: {
                    archive: 'rozwiazanie.zip'
                },
                files: [{
                    src: ['package.json', 'bower.json', 'less/styl.less', 'public/js/skrypt.js']
                }]
            }
        }
    });
};
