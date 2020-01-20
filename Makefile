VERSION = 0.5.1

RS := $(shell find ./src -name '*.rs')
OUT = ./target

WIN := x86_64-pc-windows-gnu
LINUX := armv7-unknown-linux-gnueabihf arm-unknown-linux-gnueabihf x86_64-unknown-linux-gnu 
MAC := x86_64-apple-darwin
NIX:= $(LINUX) $(MAC)
CROSS_NIX := $(addprefix $(OUT)/, $(addsuffix /release/dlphn, $(NIX)))
CROSS_WIN := $(addprefix $(OUT)/, $(addsuffix /release/dlphn.exe, $(WIN)))
TAR := $(addprefix dlphn-$(VERSION)-, $(addsuffix .tar.gz, $(NIX)))
ZIP := $(addprefix dlphn-$(VERSION)-, $(addsuffix .zip, $(WIN)))

TS_CLIENT := $(shell find ./ui/src/client -name '*.ts')
UI_TS := $(shell find ./ui/src -name '*.ts*')
UI := $(shell find ./ui/build/static -name '*.js')
UI_DEPS = ./ui/yarn.lock

all: ui-deps $(UI) $(CROSS_NIX) $(CROSS_WIN)
release: $(ZIP) $(TAR)

ui-deps:
	@cd ui && yarn

$(TS_CLIENT): ./docs/openapi.json
	@echo "generating dlphn typescript client"
	@docker run --rm -v ${PWD}/ui/src:/out -v ${PWD}/docs:/in openapitools/openapi-generator-cli generate -i /in/openapi.json -g typescript-fetch -o /out/client
	@rm -rf ui/src/client/.openapi-generator
	@rm -rf ui/src/client/.openapi-generator-ignore

$(UI): $(TS_CLIENT) $(UI_TS)
	@echo "building dlphn ui"
	@cd ui && yarn build

$(CROSS_NIX): $(OUT)/%/release/dlphn: $(RS) $(UI)
	cross build --release --target=$*

$(CROSS_WIN): $(OUT)/%/release/dlphn.exe: $(RS) $(UI)
	cross build --release --target=$*

$(ZIP): dlphn-$(VERSION)-%.zip: $(OUT)/%/release/dlphn.exe
	@rm -f dlphn-$(VERSION)-$*.zip
	@zip -j $@ ./target/$*/release/dlphn.exe

$(TAR): dlphn-$(VERSION)-%.tar.gz: $(OUT)/%/release/dlphn
	@rm -f dlphn-$(VERSION)-$*.tar.gz
	@tar czvf $@ -C ./target/$*/release dlphn

clean:
	@cargo clean
	@rm dlphn-$(VERSION)-*.zip
	@rm dlphn-$(VERSION)-*.tar.gz

bench:
	wrk -t10 -c100 -d 30s -s bench/post.lua http://localhost:8080/api/v1/streams/bench/data

.PHONY: bench ui-deps release all
