OUT = ./target
VERSION = 0.5.1

WIN := x86_64-pc-windows-gnu
LINUX := armv7-unknown-linux-gnueabihf arm-unknown-linux-gnueabihf x86_64-unknown-linux-gnu 
MAC := x86_64-apple-darwin
ARCH := $(LINUX) $(WIN) $(MAC)
CROSS := $(addprefix $(OUT)/, $(addsuffix /release/dlphn, $(ARCH)))

TAR_ARCH := $(LINUX) $(MAC)
TAR := $(addprefix dlphn-$(VERSION)-, $(addsuffix .tar.gz, $(TAR_ARCH)))
ZIP := $(addprefix dlphn-$(VERSION)-, $(addsuffix .zip, $(WIN)))

all: ui $(ZIP) $(TAR)

ui-deps:
	@cd ui && yarn

ui-client: ui-deps
	@echo "generating dlphn typescript client"
	@docker run --rm -v ${PWD}/ui/src:/out -v ${PWD}/docs:/in openapitools/openapi-generator-cli generate -i /in/openapi.json -g typescript-fetch -o /out/client
	@rm -rf ui/src/client/.openapi-generator
	@rm -rf ui/src/client/.openapi-generator-ignore

ui: ui-deps ui-client
	@echo "building dlphn ui"
	@cd ui && yarn build

$(CROSS): $(OUT)/%/release/dlphn:
	cross build --release --target=$*

$(ZIP): dlphn-$(VERSION)-%.zip: $(CROSS)
	@zip -j $@ ./target/$*/release/dlphn.exe

$(TAR): dlphn-$(VERSION)-%.tar.gz: $(CROSS)
	@tar czvf $@ -C ./target/$*/release dlphn

clean:
	@cargo clean
	@rm dlphn-$(VERSION)-*.zip
	@rm dlphn-$(VERSION)-*.tar.gz

bench:
	wrk -t10 -c100 -d 30s -s bench/post.lua http://localhost:8080/api/v1/streams/bench/data

.PHONY: bench ui ui-client ui-deps release all
