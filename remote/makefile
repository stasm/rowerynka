export SHELL := /bin/bash
export PATH  := $(CURDIR)/node_modules/.bin:$(PATH)

PACKAGE := $(CURDIR)/../dist/remote
SOURCES := $(wildcard $(CURDIR)/*.js)

# The default target.
all: lint build

build: $(PACKAGE)

$(PACKAGE): $(SOURCES)
	@mkdir -p $(PACKAGE)
	@rollup $(CURDIR)/index.js \
	    --external body-parser,crypto,express,fluent,fluent-intl-polyfill,geolib,node-fetch,querystring \
	    --format cjs \
	    --output $@/index.js
	@cp $(CURDIR)/package.json $(PACKAGE)
	@echo -e " $(OK) $@ built"

clean:
	@rm -rf $(PACKAGE)
	@echo -e " $(OK) clean"

lint:
	@eslint --max-warnings 0 $(SOURCES)
	@echo -e " $(OK) $@"

deps:
	@npm install
	@echo -e " $(OK) $@ installed"

depsclean:
	@rm -rf node_modules
	@echo -e " $(OK) $@"

OK := \033[32;01m✓\033[0m
