package sysd

var internalServices = `
{
  "id": "_internal",
  "name": "paasbox internal",
  "env": {
    "inherit": [ "PATH", "USER", "HOME" ]
  },
  "tasks": [
    {
      "id": "elasticsearch",
      "name": "Elasticsearch",
      "service": true,
      "persist": false,
      "driver": "docker",
      "image": "docker.elastic.co/elasticsearch/elasticsearch:5.2.1",
      "network": "$PAASBOX_WSID",
      "args": [ "/docker-entrypoint.sh", "-E", "xpack.security.enabled=false" ],
      "ports": [ 9200 ],
      "port_map": [ 9200 ],
      "env": [
        "http.host=0.0.0.0",
        "transport.host=127.0.0.1"
      ]
    },
    {
      "id": "logstash",
      "name": "Logstash",
      "service": true,
      "persist": false,
      "driver": "docker",
      "image": "docker.elastic.co/logstash/logstash:5.2.2",
      "network": "$PAASBOX_WSID",
      "args": [ "logstash", "-e", "output { elasticsearch { hosts => [\"elasticsearch:9200\"] } }" ],
      "ports": [ ],
      "port_map": [ ],
      "env": [ ]
    }
  ]
}
`
