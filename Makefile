.PHONY: build start stop restart logs clean

# 建構和啟動
build:
	docker compose build

# 啟動服務
up:
	docker compose up -d

# 停止服務
down:
	docker compose down

# 重啟服務
restart: down up

# 查看日誌
logs:
	docker compose logs -f

# 清理
clean:
	docker compose down
	docker rmi tcp-test-tool
	rm -rf dist node_modules