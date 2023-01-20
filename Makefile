.PHONY: clean core frontend start format

all: clean format core frontend

clean:
	rm -rf docs
	rm -rf core/pkg
	rm -rf frontend/src/core
	rm -rf static

core:
	cd core/ ;\
	wasm-pack build --target web
	rm -rf frontend/src/core
	cp -r core/pkg/ frontend/src/core

frontend:
	cd frontend/ ;\
	npm run build
	cp -r frontend/build/ docs
	# Workaround for webpack setting the path of the webworker to /static/js/static/js
	cp -r docs/static/js temp
	mkdir docs/static/js/static
	mv temp/ docs/static/js/static/js
	
start:
	cd frontend/ ;\
	npm start

format:
	cd core/ ;\
	cargo fmt --all
	cd frontend/ ;\
	npx prettier -w .
