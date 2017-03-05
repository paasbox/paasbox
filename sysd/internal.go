package sysd

import "errors"

func loadInternal(f string) ([]byte, error) {
	switch f {
	case "elk":
		return []byte(elkStack), nil
	default:
		return nil, errors.New("internal file not found")
	}
}

var elkStack = `
{
  "id": "@elk",
  "name": "ELK stack",
  "env": {
    "inherit": [ ]
  },
  "tasks": [
    {
      "id": "elasticsearch",
      "name": "Elasticsearch",
      "service": true,
      "persist": false,
      "driver": "docker",
      "image": "docker.elastic.co/elasticsearch/elasticsearch:5.2.2",
      "network": "$PAASBOX_WSID",
      "args": [ ],
      "ports": [ 9200 ],
      "port_map": [ 9200 ],
			"volumes": [ "$PAASBOX_LOGPATH/esdata:/usr/share/elasticsearch/data" ],
      "env": [
				"xpack.security.enabled=false",
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
      "args": [ "logstash", "-e", "input { http { port => 52000 } } output { elasticsearch { hosts => [\"elasticsearch:9200\"] } }" ],
      "ports": [ 52000 ],
      "port_map": [ 52000 ],
      "env": [ ]
    },
    {
      "id": "kibana",
      "name": "Kibana",
      "service": true,
      "persist": false,
      "driver": "docker",
      "image": "docker.elastic.co/kibana/kibana:5.2.2",
      "network": "$PAASBOX_WSID",
      "args": [ ],
      "ports": [ 5601 ],
      "port_map": [ 5601 ],
      "env": [
				"XPACK_SECURITY_ENABLED=false"
			]
    }
  ]
}
`
