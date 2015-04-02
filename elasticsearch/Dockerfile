FROM elasticsearch:1.4

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

WORKDIR /

RUN echo "deb http://mirrors.aliyun.com/debian/ jessie main" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -yy openjdk-7-jdk maven git
RUN git clone https://github.com/medcl/elasticsearch-analysis-ik.git
RUN cd /elasticsearch-analysis-ik && mvn clean package
RUN cd /usr/share/elasticsearch/plugins/analysis-ik
RUN cp /elasticsearch-analysis-ik/target/releases/elasticsearch-analysis-ik-1.2.9.zip /usr/share/elasticsearch/plugins/analysis-ik/
RUN cd /usr/share/elasticsearch/plugins/analysis-ik && unzip elasticsearch-analysis-ik-1.2.9.zip && rm elasticsearch-analysis-ik-1.2.9.zip

RUN cp /elasticsearch-analysis-ik/config/ik /usr/share/elasticsearch/config/
RUN cp /elasticsearch-analysis-ik/config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
RUN cp /elasticsearch-analysis-ik/config/logging.yml /usr/share/elasticsearch/config/logging.yml


# install mongo elastic river https://github.com/richardwilly98/elasticsearch-river-mongodb/wiki

RUN ./usr/share/elasticsearch/bin/elasticsearch -install elasticsearch/elasticsearch-mapper-attachments/2.4.1
RUN ./usr/share/elasticsearch/bin/elasticsearch -i com.github.richardwilly98.elasticsearch/elasticsearch-river-mongodb/2.0.6


EXPOSE 9200 9300

CMD ./usr/share/elasticsearch/bin/elasticsearch elasticsearch/elasticsearch-mapper-attachments/2.4.1
