package task

type devInstance struct {
	ports []int
}

// NewDevInstance ...
func NewDevInstance(ports []int) Instance {
	return &devInstance{
		ports: ports,
	}
}

func (d *devInstance) Start() error {
	return nil
}
func (d *devInstance) Stop() error {
	return nil
}
func (d *devInstance) Running() bool {
	return true
}
func (d *devInstance) ID() string {
	return "dev"
}
func (d *devInstance) Stdout() string {
	return ""
}
func (d *devInstance) Stderr() string {
	return ""
}
func (d *devInstance) Pid() int {
	return -1
}
func (d *devInstance) Driver() string {
	return ""
}
func (d *devInstance) Command() string {
	return ""
}
func (d *devInstance) Args() []string {
	return []string{}
}
func (d *devInstance) Env() []string {
	return []string{}
}
func (d *devInstance) Pwd() string {
	return ""
}
func (d *devInstance) Ports() []int {
	return d.ports
}
func (d *devInstance) PortMap() []int {
	return []int{}
}
func (d *devInstance) Image() string {
	return ""
}
func (d *devInstance) Network() string {
	return ""
}
func (d *devInstance) Volumes() []string {
	return []string{}
}
