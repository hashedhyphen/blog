NPM_BIN := ./node_modules/.bin

MD_FILES := $(wildcard src/markdown/*.md)

all: build

build: $(MD_FILES)
	node tools/build.js $^

clean:
	$(NPM_BIN)/del -f __build
