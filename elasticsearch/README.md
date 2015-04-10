# How to make elastic search for things work with mongo

## Start mongo instance, simple instance

No replica set needed

## Build elastic search with ik-analyser

[es-ik](https://github.com/medcl/elasticsearch-analysis-ik)

Use the Dockerfile provided [Dockerfile](./Dockerfile)

## Start es:ik

## Create Index
```bash
curl -XPUT http://localhost:9200/mongoindex
```

## Configure the index

 - Create Mapping, only the title is needed to indexed
 
```bash
#!/bin/bash
curl -XPOST http://localhost:9200/mongoindex/thing/_mapping -d'
{
    "thing": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
            "title": {
                "type": "string",
                "store": "no",
                "term_vector": "with_positions_offsets",
                "indexAnalyzer": "ik",
                "searchAnalyzer": "ik",
                "include_in_all": "true",
                "boost": 8
            }
        }
    }
}'
```

## Post data to http://localhost:9200/mongoindex/thing/
Use [npm-elasticsearch](https://www.npmjs.com/package/elasticsearch)


## Search with 

```bash
curl -XPOST http://localhost:9200/mongoindex/thing/_search  -d'
{
    "query" : { "term" : { "content" : "小泰克" }},
    "highlight" : {
        "pre_tags" : ["<tag1>", "<tag2>"],
        "post_tags" : ["</tag1>", "</tag2>"],
        "fields" : {
            "content" : {}
        }
    }
}'

```
