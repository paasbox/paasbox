VERSION := 0.1.0-alpha
BUILD_DATE := `date +%Y-%m-%d\ %H:%M`
VERSIONFILE := version/version.go

all: build test

build: generate version
	go install -tags 'production' ./cmd/...

test: generate
	go test -tags 'debug' ./...

version:
	# FIXME -ldflags would be better to avoid source changes on build
	# http://grokbase.com/t/gg/golang-nuts/14c4dtb7ta/go-nuts-using-ldflags-to-set-variables-in-package-other-than-main
	# https://stackoverflow.com/questions/11354518/golang-application-auto-build-versioning
	rm -f $(VERSIONFILE)
	@echo "package version" > $(VERSIONFILE)
	@echo "import \"fmt\"" >> $(VERSIONFILE)
	@echo "const (" >> $(VERSIONFILE)
	@echo "  // Version is the version" >> $(VERSIONFILE)
	@echo "  Version = \"$(VERSION)\"" >> $(VERSIONFILE)
	@echo "  // BuildDate is the build date" >> $(VERSIONFILE)
	@echo "  BuildDate = \"$(BUILD_DATE)\"" >> $(VERSIONFILE)
	@echo ")" >> $(VERSIONFILE)
	@echo "// String returns a formatted version and build date string" >> $(VERSIONFILE)
	@echo "func String() string {" >> $(VERSIONFILE)
	@echo " return fmt.Sprintf(\"%s (%s)\", Version, BuildDate)" >> $(VERSIONFILE)
	@echo "}" >> $(VERSIONFILE)
	go fmt $(VERSIONFILE)

generate: ${GOPATH}/bin/go-bindata
	# build the production version
	cd assets; ${GOPATH}/bin/go-bindata -o templates.go -pkg assets templates/... css/... js/... images/...
	{ echo "// +build production"; cat assets/templates.go; } > assets/templates.go.new
	mv assets/templates.go.new assets/templates.go
	# build the dev version
	cd assets; ${GOPATH}/bin/go-bindata -debug -o debug.go -pkg assets templates/... css/... js/... images/...
	{ echo "// +build debug"; cat assets/debug.go; } > assets/debug.go.new
	mv assets/debug.go.new assets/debug.go

${GOPATH}/bin/go-bindata:
	go get -u github.com/jteeuwen/go-bindata/go-bindata

debug: build
	go build -tags 'debug' -o ./build/pb ./cmd/pb
	HUMAN_LOG=1 ./build/pb stacks/ons-stack.json

ws: build
	go build -tags 'debug' -o ./build/pb ./cmd/pb
	HUMAN_LOG=1 ./build/pb example/stacks.json

elk: build
	HUMAN_LOG=1 PAASBOX_LOG=logstash@http://localhost:52000 pb @elk example/elk_demo.json

.PHONY: all test version debug elk
