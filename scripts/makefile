export SHELL := /bin/bash
export PATH  := $(CURDIR)/node_modules/.bin:$(PATH)

SOURCES := $(wildcard $(CURDIR)/*.js)

# The default target.
all: lint

lint:
	@eslint --max-warnings 0 $(SOURCES)
	@echo -e " $(OK) $@"

OK := \033[32;01m✓\033[0m
