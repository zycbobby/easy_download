FROM elasticsearch:1.4

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

WORKDIR /

RUN echo "deb http://mirrors.aliyun.com/debian/ jessie main" > /etc/apt/sources.list

RUN apt-get update
RUN apt-get install -yy openjdk-7-jdk maven git vim
RUN git clone https://github.com/medcl/elasticsearch-analysis-ik.git
RUN cd /elasticsearch-analysis-ik && mvn clean package

RUN ./usr/share/elasticsearch/bin/plugin -i mobz/elasticsearch-head
# RUN ./usr/share/elasticsearch/bin/plugin -i elasticsearch/marvel/latest

# install shield, but license would expire, use nginx to provide basic authentication instead
# RUN ./usr/share/elasticsearch/bin/plugin -i elasticsearch/license/latest
# RUN ./usr/share/elasticsearch/bin/plugin -i elasticsearch/shield/latest
RUN ./usr/share/elasticsearch/bin/shield/esusers useradd zuo -r admin -p 123

RUN cd /usr/share/elasticsearch/plugins/ && mkdir analysis-ik
RUN cp /elasticsearch-analysis-ik/target/releases/elasticsearch-analysis-ik-1.2.9.zip /usr/share/elasticsearch/plugins/analysis-ik/elasticsearch-analysis-ik-1.2.9.zip
RUN cd /usr/share/elasticsearch/plugins/analysis-ik && unzip elasticsearch-analysis-ik-1.2.9.zip && rm elasticsearch-analysis-ik-1.2.9.zip

RUN cp -r /elasticsearch-analysis-ik/config/ik /usr/share/elasticsearch/config/
RUN cp /elasticsearch-analysis-ik/config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
RUN echo "\nindex.number_of_shards: 1\n" >> /usr/share/elasticsearch/config/elasticsearch.yml
RUN echo "index.number_of_replicas: 0\n" >> /usr/share/elasticsearch/config/elasticsearch.yml
RUN echo "bootstrap.mlockall: true\n" >> /usr/share/elasticsearch/config/elasticsearch.yml

RUN cp /elasticsearch-analysis-ik/config/logging.yml /usr/share/elasticsearch/config/logging.yml

RUN copy ./etc.default.elasticsearch /etc/default/elasticsearch

# install mongo elastic river https://github.com/richardwilly98/elasticsearch-river-mongodb/wiki

# RUN ./usr/share/elasticsearch/bin/plugin -install elasticsearch/elasticsearch-mapper-attachments/2.4.3
# RUN ./usr/share/elasticsearch/bin/plugin -i com.github.richardwilly98.elasticsearch/elasticsearch-river-mongodb/2.0.9
# RUN ./usr/share/elasticsearch/bin/plugin -i lmenezes/elasticsearch-kopf/1.4.7

EXPOSE 9200 9300

# CMD ./usr/share/elasticsearch/bin/elasticsearch
CMD /etc/init.d/elasticsearch
