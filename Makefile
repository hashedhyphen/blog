NPM_BIN := ./node_modules/.bin

MD_FILES := $(wildcard src/markdown/*.md)

all: build

build: $(MD_FILES)
	node tools/build.js $^

webpack:
	$(NPM_BIN)/webpack --config webpack.config.js

lint:
	$(NPM_BIN)/eslint tools/*.js

server:
	$(NPM_BIN)/webpack-dev-server --content-base __build/

clean:
	$(NPM_BIN)/del -f __build
