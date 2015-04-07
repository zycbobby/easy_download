# Noted that you have remove the remo
ssh root@misscatandzuozuo.info rm -rf /mnt/ext/easy_download/
ssh root@misscatandzuozuo.info mkdir /mnt/ext/easy_download/
scp -r ./dist/ root@misscatandzuozuo.info:/mnt/ext/easy_download/dist
scp ./Dockerfile root@misscatandzuozuo.info:/mnt/ext/easy_download/Dockerfile
scp ./docker-compose.yml root@misscatandzuozuo.info:/mnt/ext/easy_download/docker-compose.yml
