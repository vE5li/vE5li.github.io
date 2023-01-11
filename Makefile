.PHONY: clean core frontend

clean:
	rm -rf docs
	rm -rf core/pkg
	rm -rf frontend/src/core
	rm -rf static

core:
	cd core/ ;\
	wasm-pack build --target web
	cp -r core/pkg/ frontend/src/core

frontend:
	cd frontend/ ;\
	npm run build
	cp -r frontend/build/ docs
	
start:
	cd frontend/ ;\
	npm start

format:
	cd frontend/ ;\
	npx prettier -w .