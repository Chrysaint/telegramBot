start: 
	docker-compose up -d

build: 
	docker-compose up -d --build

restart:
	make down && make build

down: 
	docker-compose down

pm2-start:
	cd tgBot && pm2 start parseBot.js forwardBot.js --watch

pm2-stop:
	pm2 kill