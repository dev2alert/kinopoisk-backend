build:
	npm run build
	docker build . -t dev2alert/kinopoisk
push:
	docker push dev2alert/kinopoisk
pull:
	docker pull dev2alert/kinopoisk
run:
	docker-compose up
stop:
	docker-compose stop
run-dev:
	docker run --rm -d -p 3306:3306 --name kinopoisk-dev-db -v "kinopoisk-dev-db:/var/lib/mysql" -e MYSQL_ROOT_PASSWORD=qwerty123 -e MYSQL_DATABASE=kinopoisk mysql
	timeout -t 30
	npm run dev
stop-dev:
	docker stop kinopoisk-db