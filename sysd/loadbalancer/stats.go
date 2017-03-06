package loadbalancer

type listenerStat struct {
	statType listenerStatType
	n        int64
}

type listenerStatType int

const (
	statTX listenerStatType = iota
	statRX
	statConn
	statConnError
	statReadError
	statWriteError
	statDialError
)

// LBStats ...
type LBStats struct {
	Connections      ConnectionStats `json:"connections"`
	Bytes            ByteStats       `json:"bytes"`
	ConnectionErrors int64           `json:"connection_errors"`
	DialErrors       int64           `json:"dial_errors"`
	ReadErrors       int64           `json:"read_errors"`
	WriteErrors      int64           `json:"write_errors"`
	Listeners        map[int]Stats   `json:"listeners"`
}

// Stats ...
type Stats struct {
	Connections      ConnectionStats `json:"connections"`
	Bytes            ByteStats       `json:"bytes"`
	ConnectionErrors int64           `json:"connection_errors"`
	DialErrors       int64           `json:"dial_errors"`
	ReadErrors       int64           `json:"read_errors"`
	WriteErrors      int64           `json:"write_errors"`
	HealthyInstances int64           `json:"healthy_instances"`
}

// ConnectionStats ...
type ConnectionStats struct {
	Total  int64 `json:"total"`
	Active int64 `json:"active"`
}

// ByteStats ...
type ByteStats struct {
	Sent     int64 `json:"sent"`
	Received int64 `json:"received"`
}
