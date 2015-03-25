{
  "name": "{{name}}",
  "version": "{{version}}",
  "homepage": "https://github.com/mamboer/{{name}}",
  "authors": ["{{author|raw}}"],
  "description": "{{description}}",
  "main": "{{main}}",
  "keywords": {{keywords|raw|json}},
  "license": "MIT",
  "dependencies":{
      "classor":"~1.0.0"    
  },
  "ignore": [
    "gulpfile.js",
    "*.swig",
    "src",
    "**/.*",
    "node_modules",
    "bower_components",
    "test",
    "tests",
    "*.json",
    "site",
    "*.html"
  ]
}
