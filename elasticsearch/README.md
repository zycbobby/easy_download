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
    "query" : { "match" : { "title" : "小泰克" }},
    "highlight" : {
        "pre_tags" : ["<tag1>", "<tag2>"],
        "post_tags" : ["</tag1>", "</tag2>"],
        "fields" : {
            "content" : {}
        }
    }
}'

```

## How to check the indices
```bash
curl -XGET http://localhost:9200/mongoindex/_analyze?analyzer=ik&text=炫彩字母！C＆A 2015早春新款男式字母印花圆领短袖T恤 天猫商城79元包邮

```

## How to parse the search string
```bash
curl -XPOST http://localhost:9200/mongoindex/_validate/query?explain -d '
{
  "query": {
    "match": {
      "title": "天猫商城"
    }
  }
}
'
```

# Search like a database

** You should not use elastic search as a database **

POST to http://es.misscatandzuozuo.info/_all/thing/_search with data

```
{
  "fields": [
    "_parent",
    "_source"
  ],
  "query": {
    "bool": {
      "must": [],
      "must_not": [],
      "should": [
        {
          "match_all": {}
        }
      ]
    }
  },
  "from": 0,
  "size": 1,
  "sort": [
    {
      "createdAt": {
        "reverse": true
      }
    }
  ],
  "facets": {},
  "version": true
}
```

```bash
curl -XPOST http://name:pwd@es.misscatandzuozuo.info/_all/thing/_search -d'
{
  "fields": [
    "_parent",
    "_source"
  ],
  "query": {
    "bool": {
      "must": [],
      "must_not": [],
      "should": [
        {
          "match_all": {}
        }
      ]
    }
  },
  "from": 0,
  "size": 1,
  "sort": [
    {
      "createdAt": {
        "reverse": true
      }
    }
  ],
  "facets": {},
  "version": true
}
'
