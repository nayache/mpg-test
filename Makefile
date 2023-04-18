.PHONY: start stop rm

start: 
	docker-compose up --build

detach:
	docker-compose up --build -d
	@echo "\e[32m\nmpg server is running on background!\e[0m"

stop:
	docker-compose stop

rm:
	docker rm couchbase

clean: stop rm