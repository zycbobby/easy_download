curl -XPUT 'http://localhost:9200/_river/mongodb/_meta' -d '{
    "type": "mongodb",
    "mongodb": {
      "servers":
      [
        { "host": "172.26.142.29", "port": 27017 }
      ],
      "db": "easydownload-dev",
      "collection": "things"
    },
    "index": {
      "name": "mongoindex",
      "type": "thing"
    }
  }'
