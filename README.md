for running from the Dockerfile, execute the following commands:

`docker run -d -p 9000:9000 -p 9001:9001 quay.io/minio/minio server /data --console-address ":9001"`

`docker run -d -p 27017:27017 --name mongodb -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo`

`docker build -t my-backend .`

`docker run --rm -p 3000:3000 --network="host" my-backend`
